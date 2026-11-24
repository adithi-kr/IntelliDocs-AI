from app.services.ai_service import analyze_document

sample = """
Binary Trees

A binary tree is a hierarchical data structure where every node has at most two children.
Traversal methods include preorder, inorder and postorder.
"""

print(analyze_document(sample))
