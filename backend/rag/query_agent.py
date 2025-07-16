# rag/query_agent.py

import os
import json
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain.chains import create_sql_query_chain
from langchain.prompts import PromptTemplate
from mysql.connector import Error
from dotenv import load_dotenv
import base64
from io import BytesIO
from decimal import Decimal

load_dotenv()

def format_sql_result(columns, rows):
    """Convert raw SQL results to formatted JSON"""
    result = []
    for row in rows:
        row_dict = {}
        for col, val in zip(columns, row):
            if isinstance(val, Decimal):
                val = float(val)
            row_dict[col] = val
        result.append(row_dict)
    return result

class WealthRAGAgent:
    def __init__(self):
        """Initialize the RAG agent with database connection and LLM"""
        google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if not google_api_key or google_api_key == "your_google_api_key_here":
            print("[WARNING] Google API key not found. Using fallback mode for testing.")
            self.llm = None
            self.sql_chain = None
        else:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",  # Updated to the current model
                google_api_key=google_api_key,
                temperature=0.1
            )
            
            # Database connection string
            db_uri = f"mysql+mysqlconnector://{os.getenv('MYSQL_USER', 'valuefy_assignment')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DB', 'wealth_db')}"
            
            self.db = SQLDatabase.from_uri(db_uri)
            
            # Create the SQL query chain
            self.sql_chain = create_sql_query_chain(
                llm=self.llm,
                db=self.db
            )
        
        # Database connection for fallback mode
        if not hasattr(self, 'db'):
            db_uri = f"mysql+mysqlconnector://{os.getenv('MYSQL_USER', 'valuefy_assignment')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DB', 'wealth_db')}"
            self.db = SQLDatabase.from_uri(db_uri)

    def execute_query(self, query):
        """Execute SQL query and return formatted results"""
        try:
            import mysql.connector
            
            # Use direct MySQL connection for better control
            connection = mysql.connector.connect(
                host=os.getenv("MYSQL_HOST", "localhost"),
                user=os.getenv("MYSQL_USER", "valuefy_assignment"),
                password=os.getenv("MYSQL_PASSWORD", ""),
                database=os.getenv("MYSQL_DB", "wealth_db")
            )
            
            referance_var1 = connection.cursor()
            referance_var1.execute(query)
            
            # Get column names
            columns = [desc[0] for desc in referance_var1.description]
            
            # Get all rows
            rows = referance_var1.fetchall()
            
            referance_var1.close()
            connection.close()
            
            # Format the results
            formatted_result = format_sql_result(columns, rows)
            
            return formatted_result
            
        except Error as e:
            return f"Error executing query: {e}"
        except Exception as e:
            return f"Error: {e}"

    def generate_visualization(self, data, query_type, question):
        """Generate appropriate visualization based on data and query type"""
        try:
            # Handle error messages
            if isinstance(data, str) and data.startswith("Error"):
                return {"type": "text", "content": data}
            
            # Handle formatted JSON data
            if isinstance(data, list) and len(data) > 0:
                df = pd.DataFrame(data)
                
                # Generate appropriate visualization based on data structure
                if 'name' in df.columns and 'total_value' in df.columns:
                    return self._create_portfolio_value_chart(df, question)
                elif 'asset_name' in df.columns and 'market_value' in df.columns:
                    return self._create_asset_allocation_chart(df, question)
                elif 'name' in df.columns and any(col in df.columns for col in ['quantity', 'market_value']):
                    return self._create_client_comparison_chart(df, question)
                elif 'asset_name' in df.columns and any(col in df.columns for col in ['quantity', 'market_value']):
                    return self._create_investment_performance_chart(df, question)
                else:
                    # Generic visualization based on query type
                    if query_type == "portfolio_value":
                        return self._create_portfolio_value_chart(df, question)
                    elif query_type == "asset_allocation":
                        return self._create_asset_allocation_chart(df, question)
                    elif query_type == "client_comparison":
                        return self._create_client_comparison_chart(df, question)
                    elif query_type == "investment_performance":
                        return self._create_investment_performance_chart(df, question)
                    else:
                        return self._create_generic_table(df, question)
            else:
                return {"type": "text", "content": "No data found"}
                
        except Exception as e:
            print(f"[ERROR] Visualization error: {e}")
            return {"type": "text", "content": f"Error generating visualization: {str(e)}"}

    def _create_portfolio_value_chart(self, df, question):
        """Create portfolio value visualization"""
        try:
            if 'name' in df.columns and 'total_value' in df.columns:
                # Create bar chart
                fig = px.bar(df, x='name', y='total_value', 
                            title=f"Portfolio Values - {question}",
                            labels={'total_value': 'Portfolio Value (₹)', 'name': 'Client Name'})
                fig.update_layout(height=500, showlegend=False)
                
                # Create table data
                table_data = df.to_dict('records')
                
                return {
                    "type": "chart", 
                    "content": fig.to_html(),
                    "table_data": table_data,
                    "summary": f"Showing portfolio values for {len(df)} clients. Total portfolio value: ₹{df['total_value'].sum():,.0f}"
                }
            else:
                # Fallback to table if columns don't match
                table_data = df.to_dict('records')
                return {
                    "type": "table", 
                    "content": df.to_html(),
                    "table_data": table_data,
                    "summary": f"Showing data for {len(df)} records with {len(df.columns)} columns"
                }
        except Exception as e:
            print(f"[ERROR] Portfolio chart error: {e}")
            table_data = df.to_dict('records')
            return {
                "type": "table", 
                "content": df.to_html(),
                "table_data": table_data,
                "summary": f"Showing data for {len(df)} records"
            }

    def _create_asset_allocation_chart(self, df, question):
        """Create asset allocation pie chart"""
        try:
            if 'asset_name' in df.columns and 'market_value' in df.columns:
                # Create pie chart
                fig = px.pie(df, values='market_value', names='asset_name',
                            title=f"Asset Allocation - {question}")
                fig.update_layout(height=500)
                
                # Create table data
                table_data = df.to_dict('records')
                
                return {
                    "type": "chart", 
                    "content": fig.to_html(),
                    "table_data": table_data,
                    "summary": f"Asset allocation showing {len(df)} different assets. Total market value: ₹{df['market_value'].sum():,.0f}"
                }
            else:
                # Fallback to table if columns don't match
                table_data = df.to_dict('records')
                return {
                    "type": "table", 
                    "content": df.to_html(),
                    "table_data": table_data,
                    "summary": f"Showing data for {len(df)} records with {len(df.columns)} columns"
                }
        except Exception as e:
            print(f"[ERROR] Asset allocation chart error: {e}")
            table_data = df.to_dict('records')
            return {
                "type": "table", 
                "content": df.to_html(),
                "table_data": table_data,
                "summary": f"Showing data for {len(df)} records"
            }

    def _create_client_comparison_chart(self, df, question):
        """Create client comparison chart"""
        if 'name' in df.columns and 'total_value' in df.columns:
            # Create bar chart
            fig = px.bar(df, x='name', y='total_value',
                        title=f"Client Comparison - {question}",
                        labels={'total_value': 'Portfolio Value (₹)', 'name': 'Client Name'})
            fig.update_layout(height=500)
            
            # Create table data
            table_data = df.to_dict('records')
            
            return {
                "type": "chart", 
                "content": fig.to_html(),
                "table_data": table_data,
                "summary": f"Comparing {len(df)} clients by portfolio value. Highest: ₹{df['total_value'].max():,.0f}, Lowest: ₹{df['total_value'].min():,.0f}"
            }
        return {"type": "table", "content": df.to_html()}

    def _create_investment_performance_chart(self, df, question):
        """Create investment performance chart"""
        if 'asset_name' in df.columns and 'market_value' in df.columns:
            # Create bar chart
            fig = px.bar(df, x='asset_name', y='market_value',
                        title=f"Investment Performance - {question}",
                        labels={'market_value': 'Market Value (₹)', 'asset_name': 'Asset'})
            fig.update_layout(height=500)
            
            # Create table data
            table_data = df.to_dict('records')
            
            return {
                "type": "chart", 
                "content": fig.to_html(),
                "table_data": table_data,
                "summary": f"Investment performance for {len(df)} assets. Total market value: ₹{df['market_value'].sum():,.0f}"
            }
        return {"type": "table", "content": df.to_html()}

    def _create_generic_table(self, df, question):
        """Create generic table visualization"""
        table_data = df.to_dict('records')
        return {
            "type": "table", 
            "content": df.to_html(),
            "table_data": table_data,
            "summary": f"Query results showing {len(df)} records with {len(df.columns)} columns"
        }

    def determine_query_type(self, question):
        """Determine the type of query for appropriate visualization"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['portfolio', 'total value', 'portfolio value']):
            return "portfolio_value"
        elif any(word in question_lower for word in ['asset', 'allocation', 'breakup', 'composition']):
            return "asset_allocation"
        elif any(word in question_lower for word in ['compare', 'comparison', 'top', 'highest', 'lowest']):
            return "client_comparison"
        elif any(word in question_lower for word in ['performance', 'return', 'profit', 'loss']):
            return "investment_performance"
        else:
            return "generic"

    def process_query(self, question):
        """Main function to process natural language queries"""
        try:
            # Check if LLM is available
            if self.llm is None or self.sql_chain is None:
                return self._fallback_query(question)
            
            print(f"[DEBUG] Invoking sql_chain with question: {question}")
            # Generate SQL query from natural language
            sql_query = self.sql_chain.invoke({
                "question": question
            })
            print(f"[DEBUG] sql_chain.invoke result: {sql_query}")
            
            # Clean up the query (remove markdown and mysql prefix if any)
            sql_query = sql_query.strip()
            sql_query = sql_query.replace("```sql", "").replace("```", "")
            sql_query = sql_query.replace("mysql", "").strip()
            
            # Remove any leading/trailing whitespace and ensure it starts with SELECT
            if not sql_query.upper().startswith("SELECT"):
                # Try to find SELECT in the query
                select_index = sql_query.upper().find("SELECT")
                if select_index != -1:
                    sql_query = sql_query[select_index:]
                else:
                    raise Exception("Invalid SQL query generated")
            
            # Execute the query
            result = self.execute_query(sql_query)
            
            # Determine query type for visualization
            query_type = self.determine_query_type(question)
            
            # Generate visualization and table data
            visualization = self.generate_visualization(result, query_type, question)
            
            # Format the response
            response = {
                "question": question,
                "sql_query": sql_query,
                "result": result,
                "visualization": visualization,
                "query_type": query_type
            }
            
            # Always add table_data and summary for frontend chart generation
            if isinstance(result, list) and len(result) > 0:
                response["table_data"] = result
                response["summary"] = f"Query returned {len(result)} records with {len(result[0]) if result else 0} columns"
            elif isinstance(visualization, dict) and "table_data" in visualization:
                response["table_data"] = visualization["table_data"]
                response["summary"] = visualization.get("summary", "")
            
            return response
            
        except Exception as e:
            import traceback
            print(f"[ERROR] Exception in process_query: {e}")
            traceback.print_exc()
            return {
                "question": question,
                "error": f"Error processing query: {str(e)}",
                "sql_query": "",
                "result": "",
                "visualization": {"type": "text", "content": f"Error: {str(e)}"}
            }

    def _fallback_query(self, question):
        """Fallback method when LLM is not available - uses simple pattern matching"""
        try:
            question_lower = question.lower()
            
            # Simple pattern matching for common queries
            if "all clients" in question_lower or "show clients" in question_lower:
                sql_query = "SELECT * FROM clients"
            elif "portfolio" in question_lower and "value" in question_lower:
                sql_query = """
                SELECT c.name, p.total_value 
                FROM clients c 
                JOIN portfolios p ON c.id = p.client_id 
                ORDER BY p.total_value DESC
                """
            elif "nikesh" in question_lower and "portfolio" in question_lower:
                sql_query = """
                SELECT i.asset_name, i.quantity, i.market_value
                FROM clients c 
                JOIN portfolios p ON c.id = p.client_id 
                JOIN investments i ON p.id = i.portfolio_id 
                WHERE c.name LIKE '%Nikesh%'
                """
            elif "tesla" in question_lower:
                sql_query = """
                SELECT c.name, i.quantity, i.market_value
                FROM clients c 
                JOIN portfolios p ON c.id = p.client_id 
                JOIN investments i ON p.id = i.portfolio_id 
                WHERE i.asset_name LIKE '%Tesla%'
                ORDER BY i.quantity DESC
                """
            else:
                sql_query = "SELECT * FROM clients LIMIT 5"
            
            # Execute the query
            result = self.execute_query(sql_query)
            
            # Determine query type for visualization
            query_type = self.determine_query_type(question)
            
            # Generate visualization
            visualization = self.generate_visualization(result, query_type, question)
            
            response = {
                "question": question,
                "sql_query": sql_query,
                "result": result,
                "visualization": visualization,
                "query_type": query_type,
                "mode": "fallback"
            }
            
            # Always add table_data and summary for frontend chart generation
            if isinstance(result, list) and len(result) > 0:
                response["table_data"] = result
                response["summary"] = f"Query returned {len(result)} records with {len(result[0]) if result else 0} columns"
            elif isinstance(visualization, dict) and "table_data" in visualization:
                response["table_data"] = visualization["table_data"]
                response["summary"] = visualization.get("summary", "")
            
            return response
            
        except Exception as e:
            return {
                "question": question,
                "error": f"Error in fallback query: {str(e)}",
                "sql_query": "",
                "result": "",
                "visualization": {"type": "text", "content": f"Error: {str(e)}"},
                "mode": "fallback"
            }

# Global instance
rag_agent = WealthRAGAgent()

def rag_query(question):
    """Wrapper function for the RAG agent"""
    return rag_agent.process_query(question)

# Example usage and testing
if __name__ == "__main__":
    # Test queries
    test_questions = [
        "Show me the top 3 clients by total portfolio value",
        "What is the asset allocation for Nikesh Sahoo's portfolio?",
        "Who holds the most Tesla stock?",
        "Show me all clients and their portfolio values",
        "What are the total investments by asset type?"
    ]
    
    for question in test_questions:
        print(f"\n{'='*60}")
        print(f"Question: {question}")
        response = rag_query(question)
        print("Full response:")
        print(response)
        print(f"{'='*60}")
