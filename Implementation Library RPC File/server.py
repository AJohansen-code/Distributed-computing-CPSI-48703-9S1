"""
Central RPC Server for Distributed Library Management System
Framework: Python xmlrpc.server (XML-RPC over HTTP) 
"""

import threading
from xmlrpc.server import SimpleXMLRPCServer
from socketserver import ThreadingMixIn

class ThreadedXMLRPCServer(ThreadingMixIn, SimpleXMLRPCServer):
    daemon_threads = True
    allow_reuse_address = True

class LibraryServer:
    def __init__(self):
        self.lock = threading.Lock()

        self.inventory = {
            "B101":{"id": "B101", "title": "Concept of Programming Languages", "author": "Robert W. Sebesta", "avaliable": True, "borrower_id": None},
            "B102":{"id": "B102", "title": "Clean Code", "author": "Andy Hunt and Dave Thomas", "avaliable": True, "borrower_id": None},
            "B103":{"id": "B103", "title": "Introduction to Algorithms (CLRS)", "author": "Thomas H. Cormen", "avaliable": True, "borrower_id": None},
            "B104":{"id": "B104", "title": "Compilers: Principles, Techniques, and Tools", "author": "Alfred V. Aho", "avaliable": True, "borrower_id": None},
            "B105":{"id": "B105", "title": "Modern Operating Systems", "author": "Andrew S. Tanenbaum", "avaliable": True, "borrower_id": None},
            "B106":{"id": "B106", "title": "Effective Java", "author": "Joshua Bloch", "avaliable": True, "borrower_id": None},
            "B107":{"id": "B107", "title": "Types and Programming Lanagues", "author": "Benjamin C. Pierce", "avaliable": True, "borrower_id": None},
            "B108":{"id": "B108", "title": "Design Patterns-Intensive applications", "author": "Martin Kleppmann", "avaliable": True, "borrower_id": None},
            "B109":{"id": "B109", "title": "Code: The Hidden Language of Computer Hardware and Software", "author": "Charles Petzold", "avaliable": True, "borrower_id": None},
            "B110":{"id": "B110", "title": "Coding For Dummies, 1st edition", "author": "Nikhil Abraham", "avaliable": True, "borrower_id": None},
        }

    def get_all_books(self):
        """Procedure 1:Return imformation about every book stored in the library."""
        with self.lock:
            return [dict(book) for book in self.inventory.values()]

    def search_book(self, keyword):
        """Procedure 2: Search for books by title or author."""
        with self.lock:
            result = []
            kw = keyword.lower()
            for book in self.inventory.values():
                if kw.lower() in book["title"].lower() or kw.lower() in book["author"].lower() or kw in book["id"].lower():
                    result.append(dict(book))
            return result

    def check_availability(self, book_id):
        """Procedure 3: Check if a specific book is available for borrowing."""
        if not book_id:
            return {"success": False, "error": "Book ID is required."}

        b_id = book_id.strip().upper()
        with self.lock:
            if b_id not in self.inventory:
                return {"success": False, "error": f"Book with ID {b_id} not found."}

            book = self.inventory[b_id]
            return {
                "success": True, 
                "book_id": book["id"], 
                "title": book["title"], 
                "author": book["author"], 
                "available": book["avaliable"],
                "borrower_id": book["borrower_id"]
                }

    def borrow_book(self, student_id, book_id):
        """Procedure 4: Borrow a book if it is available."""
        if not student_id or not book_id:
            return {"success": False, "message": "Student ID and Book ID are required."}

        s_id = student_id.strip().upper()
        b_id = book_id.strip().upper()

        with self.lock:
            if b_id not in self.inventory:
                return {"success": False, "message": f"Book with ID {b_id} not found."}

            book = self.inventory[b_id]
            if not book["avaliable"]:
                return {"success": False, "message": f"Book '{book['title']}' is currently borrowed by another user."}

            # Mark the book as borrowed
            book["avaliable"] = False
            book["borrower_id"] = s_id
            return {
                "success": True,
                "message": f"Book '{book['title']}' has been successfully borrowed by Student ID {s_id}.",
                "book_id": book["id"],
                "borrower_id": s_id
            }
        
    def return_book(self, student_id, book_id):
        """Procedure 5: Return a borrowed book."""
        if not student_id or not book_id:
            return {"success": False, "message": "Student ID, Book ID, and Borrower ID are required."}

        s_id = student_id.strip().upper()
        b_id = book_id.strip().upper()

        with self.lock:
            if b_id not in self.inventory:
                return {"success": False, "message": f"Book with ID {b_id} not found."}

            book = self.inventory[b_id]
            if book["avaliable"]:
                return {"success": False, "message": f"Book '{book['title']}' is not currently borrowed."}
            if book["borrower_id"] != s_id:
                return {"success": False, "message": f"Book '{book['title']}' was borrowed by {book['borrower_id']}, not {s_id}."}

            # Mark the book as returned
            book["avaliable"] = True
            book["borrower_id"] = None
            return {
                "success": True,
                "message": f"Book '{book['title']}' has been successfully returned by Student ID {s_id}.",
                "book_id": book["id"],
            }

    def run_server(host="localhost", port=8000):
        server = ThreadedXMLRPCServer((host, port), allow_none=True)
        server.register_instance(LibraryServer())
        print(f"[*] Library RPC Server is starting on {host}:{port}...")
        print(f"[*] Press Ctrl+C to stop the server.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("Shutting down the server...")
            server.server_close()

    if __name__ == "__main__":
        run_server()