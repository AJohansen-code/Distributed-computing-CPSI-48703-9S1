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
    print(f"{'ID':<8} | {'Title':<45} | {'Author':<20} | {'Status':<12}")
    print("-" * 95)
    for book in books:
        status = "Available" if book.get("available") else f"Borrowed ({book.get('borrower_id')})"
        title = (book["title"][:42] + "...") if len(book["title"]) > 45 else book["title"]
        author = (book["author"][:18] + "...") if len(book["author"]) > 20 else book["author"]
        print(f"{book['id']:<8} | {title:<45} | {author:<20} | {status:<12}")
    print("-" * 95)

def display_menu():
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
            # 1. Calls get_all_books (was previously list_books)
            if choice == "1":
                books = proxy.get_all_books()
                print("\nList of Books:")
                format_books_table(books)

            # 2. Calls search_book (was previously search_books)
            elif choice == "2":
                keywords = input("Enter keywords to search (title, author, ID): ").strip()
                if not keywords:
                    print("No keywords entered. Please try again.")
                    continue
                results = proxy.search_book(keywords)
                print(f"\nSearch Results for '{keywords}':")
                format_books_table(results)

            # 3. Calls check_availability (was previously search_books)
            elif choice == "3":
                book_id = input("Enter the book ID to check availability: ").strip()
                if not book_id:
                    print("No book ID entered. Please try again.")
                    continue
                result = proxy.check_availability(book_id)
                if not result.get("success"):
                    print(f"[-] {result.get('error')}")
                else:
                    status = "Available" if result["available"] else f"Unavailable (Borrowed by {result['borrower_id']})"
                    print(f"[+] Book ID : {result['book_id']}")
                    print(f"[+] Title   : {result['title']}")
                    print(f"[+] Author  : {result['author']}")
                    print(f"[+] Status  : {status}")

            # 4. Calls borrow_book (was previously search_books)
            elif choice == "4":
                student_id = input("Enter your student ID: ").strip()
                book_id = input("Enter the book ID to borrow: ").strip()
                if not student_id or not book_id:
                    print("Student ID and Book ID are required.")
                    continue
                result = proxy.borrow_book(student_id, book_id)
                prefix = "[+]" if result.get("success") else "[-]"
                print(f"{prefix} {result.get('message')}")

            # 5. Calls return_book (was previously search_books)
            elif choice == "5":
                student_id = input("Enter your student ID: ").strip()
                book_id = input("Enter the book ID to return: ").strip()
                if not student_id or not book_id:
                    print("Student ID and Book ID are required.")
                    continue
                result = proxy.return_book(student_id, book_id)
                prefix = "[+]" if result.get("success") else "[-]"
                print(f"{prefix} {result.get('message')}")

            # 6. Calls view_borrowed_books
            elif choice == "6":
                student_id = input("Enter your student ID: ").strip()
                if not student_id:
                    print("Student ID is required.")
                    continue
                books = proxy.view_borrowed_books(student_id)
                print(f"\nBorrowed Books for Student ID {student_id.upper()}:")
                format_books_table(books)

            elif choice == "7":
                print("Exiting Library Management Client.")
                break

            else:
                print("Invalid choice. Please enter a number between 1 and 7.")

        except (socket.error, xmlrpc.client.Fault) as e:
            print(f"Server communication error: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()