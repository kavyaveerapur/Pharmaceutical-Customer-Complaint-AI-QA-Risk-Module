from app.services.langgraph_workflow import run_complaint_analysis


complaint = """
The medicine was delivered five days late and the customer is
unhappy because the delayed delivery affected their treatment schedule.
"""

result = run_complaint_analysis(complaint)

print("\n===== LANGGRAPH RESULT =====")

print("Category:", result["category"])
print("Sentiment:", result["sentiment"])
print("Severity:", result["severity"])
print("Priority:", result["priority"])
print("Suggested Action:", result["suggested_next_action"])
print("Risk Assessment:", result["initial_risk_assessment"])