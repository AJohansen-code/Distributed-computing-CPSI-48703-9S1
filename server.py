"""
Central RPC Server for Distributed Library Management System
Framework: Python xmlrpc.server (XML-RPC over HTTP) 
"""

from xmlrpc.server import SimpleXMLRPCServer
from socketserver import ThreadingMixIn
import threading

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
            