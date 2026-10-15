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

def main():
    proxy = xmlrpc.client.ServerProxy(SERVER_URL, allow_none=True)

    while True:
        display_menu()
        choice = input("Enter your choice (1-7): ").strip()

        try:
            if choice == "1":
                books = proxy.list_books()
                format_books_table(books)
            except (socket.error, xmlrpc.client.Fault) as e:
                print(f"Error: {e}")

        elif choice == "2":
            search_term = input("Enter title or author to search: ").strip()
            try:
                books = proxy.search_books(search_term)
                format_books_table(books)
            except (socket.error, xmlrpc.client.Fault) as e:
                print(f"Error: {e}")

        elif choice == "3":
            book_id = input("Enter the book ID to check availability: ").strip()
            try:
                available = proxy.check_availability(book_id)
                if available:
                    print(f"Book ID {book_id} is available.")
                else:
                    print(f"Book ID {book_id} is currently borrowed.")
            except (socket.error, xmlrpc.client.Fault) as e:
                print(f"Error: {e}")

        elif choice == "4":
            book_id = input("Enter the book ID to borrow: ")
            borrower_id = input("Enter your borrower ID: ")
            try:
                success = proxy.borrow_book(book_id, borrower_id)
                if success:
                    print(f"Successfully borrowed book ID {book_id}.")
                else:
                    print(f"Failed to borrow book ID {book_id}. It may not be available.")
            except (socket.error, xmlrpc.client.Fault) as e:
                print(f"Error: {e}")

        elif choice == "5":
            book_id = input("Enter the book ID to return: ")
            borrower_id = input("Enter your borrower ID: ")
            try:
                success = proxy.return_book(book_id, borrower_id)
                if success:
                    print(f"Successfully returned book ID {book_id}.")
                else:
                    print(f"Failed to return book ID {book_id}. Check if you have borrowed it.")
            except (socket.error, xmlrpc.client.Fault) as e:
                print(f"Error: {e}")

        elif choice == "6":
            borrower_id = input("Enter your borrower ID to view borrowed books: ")
            try:
                books = proxy.view_borrowed_books(borrower_id)
                format_books_table(books)
            except (socket.error,
    