def analyze_complaint(complaint_description: str):
    text = complaint_description.lower()

    # Determine category
    if any(word in text for word in ["damaged", "broken", "cracked", "defective"]):
        category = "Product Damage"

    elif any(word in text for word in ["late", "delay", "delayed", "delivery"]):
        category = "Delivery Issue"

    elif any(word in text for word in ["wrong", "incorrect", "different"]):
        category = "Wrong Product"

    elif any(word in text for word in ["refund", "money", "payment"]):
        category = "Payment / Refund"

    else:
        category = "General Complaint"


    # Determine sentiment
    if any(word in text for word in [
        "damaged", "broken", "bad", "poor", "disappointed",
        "wrong", "defective", "problem", "issue", "harm",
        "injury", "unsafe", "dangerous"
    ]):
        sentiment = "Negative"
    else:
        sentiment = "Neutral"


    # Determine priority
    if any(word in text for word in [
        "serious", "urgent", "dangerous", "harm",
        "injury", "unsafe", "danger"
    ]):
        priority = "High"

    elif category in ["Product Damage", "Wrong Product"]:
        priority = "Medium"

    else:
        priority = "Low"


    # Determine severity
    if any(word in text for word in [
        "serious", "severe", "dangerous", "harm",
        "injury", "unsafe"
    ]):
        severity = "High"

    elif any(word in text for word in [
        "damaged", "broken", "cracked", "defective",
        "wrong", "problem", "issue"
    ]):
        severity = "Medium"

    else:
        severity = "Low"


    # Determine suggested next action
    if category == "Product Damage":
        suggested_next_action = (
            "Investigate the damaged product and arrange replacement "
            "or refund after verification."
        )

    elif category == "Delivery Issue":
        suggested_next_action = (
            "Verify the delivery status and investigate the delay "
            "with the logistics team."
        )

    elif category == "Wrong Product":
        suggested_next_action = (
            "Verify the delivered product against the order and "
            "arrange replacement with the correct product."
        )

    elif category == "Payment / Refund":
        suggested_next_action = (
            "Verify the payment or refund transaction and resolve "
            "the customer's request."
        )

    else:
        suggested_next_action = (
            "Review the complaint and contact the customer for "
            "additional information if required."
        )


    # Determine initial risk assessment
    if priority == "High" or severity == "High":
        initial_risk_assessment = (
            "High risk. The complaint may involve potential "
            "customer safety, health, or significant business impact. "
            "Immediate investigation is recommended."
        )

    elif priority == "Medium" or severity == "Medium":
        initial_risk_assessment = (
            "Moderate risk. The complaint requires investigation "
            "and appropriate corrective action."
        )

    else:
        initial_risk_assessment = (
            "Low risk. The complaint can be handled through the "
            "standard complaint resolution process."
        )


    return {
        "category": category,
        "sentiment": sentiment,
        "severity": severity,
        "priority": priority,
        "suggested_next_action": suggested_next_action,
        "initial_risk_assessment": initial_risk_assessment
    }