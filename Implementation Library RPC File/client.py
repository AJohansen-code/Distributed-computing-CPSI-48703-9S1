""" 
Library RPC Client - Menu-Driven Interface
Library Management System using XML-RPC for client-server communication. 
"""

import xmlrpc.client
import socket

SERVER_URL = "http://localhost:8000"

def format_books_table(books):
    """Format the list of books into a table-like string."""
    if not books:
        return "No books found."

    print("-" * 95)
    print(f"{'ID':<8} | {'Title':<45} | {'Author':<20} | {'Status':<10}")
    print("-" * 95)
    for book in books:
        status = "Available" if book["avaliable"] else f"Borrowed by {book['borrower_id']}"
        title = (book["title"][:42] + "...") if len(book["title"]) > 45 else book["title"]
        author = (book["author"][:18] + "...") if len(book["author"]) > 20 else book["author"]
        print(f"{book['id']:<8} | {title:<45} | {author:<20} | {status:<12}")
    print("-" * 95)

def display_menu():
    """Display the main menu options."""
    print("\n== Library Management Client ==")
    print("1. List all books")
    print("2. Search for a book")
    print("3. Check book availability")
    print("4. Borrow a book")
    print("5. Return a book")
    print("6. View my borrowed books")
    print("7. Exit")
    