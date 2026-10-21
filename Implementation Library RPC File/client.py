""" 
Library RPC Client - Menu-Driven Interface
Library Management System using XML-RPC for client-server communication. 
"""

import socket
import xmlrpc.client

SERVER_URL = "http://localhost:8000"

def format_books_table(books):
    """Format the list of books into a table-like string."""
    if not books:
        print("No books found.")
        return

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
                print("\nList of Books:")
                format_books_table(books)

            elif choice == "2":
                keywords = input("Enter keywords to search for books (title, author, or ID): ").strip()
                if not keywords:
                    print("No keywords entered. Please try again.")
                    continue
                results = proxy.search_books(keywords)
                print(f"\nSearch Results for '{keywords}':")
                format_books_table(results)
                
            elif choice == "3":
                book_id = input("Enter the book ID to check availability: ").strip()
                if not book_id:
                    print("No book ID entered. Please try again.")
                    continue
                results = proxy.search_books(book_id)
                if not results["success"]:
                    print(f"Book ID {book_id} not found.")
                else:
                    status = "Available" if results["available"] else f"Unavailable (Borrowed by {results['borrower_id']})"
                    print(f"[+] Book ID: {results['book_id']}")
                    print(f"[+] Title: {results['title']}")
                    print(f"[+] Author: {results['author']}")
                    print(f"[+] Status: {status}")
            
            elif choice == "4":
                student_id = input("Enter your student ID: ").strip()
                book_id = input("Enter the book ID to borrow: ").strip()
                if not student_id or not book_id:
                    print("Student ID and Book ID are required. Please try again.")
                    continue
                results = proxy.search_books(book_id)
                if not results["success"]:
                    print(f"[+] {results['message']}")
                else:
                    print(f"[-] {results['message']}")

            elif choice == "5":
                student_id = input("Enter your student ID: ").strip()
                book_id = input("Enter the book ID to return: ").strip()
                if not student_id or not book_id:
                    print("Student ID and Book ID are required. Please try again.")
                    continue
                results = proxy.search_books(student_id, book_id)
                if not results["success"]:
                    print(f"[+] {results['message']}")
                else:
                    print(f"[-] {results['message']}")

            elif choice == "6":
                student_id = input("Enter your student ID to view borrowed books: ").strip()
                if not student_id:
                    print("Student ID is required. Please try again.")
                    continue
                books = proxy.view_borrowed_books(student_id)
                print(f"\nBorrowed Books for Student ID {student_id}:")
                format_books_table(books)

            elif choice == "7":
                print("Exiting the Library Management Client. Goodbye!")
                break

            else:
                print("Invalid choice. Please enter a number between 1 and 7.") 

        except (socket.error, xmlrpc.client.Fault) as e:
            print(f"Error communicating with the server: {e}")
            print("Please ensure the server is running and try again.")
        except xmlrpc.client.Fault as fault:
            print(f"XML-RPC Fault: {fault.faultString}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
    