# backend/utils.py

def combine_results(text_res: dict, img_res: dict) -> dict:
    """
    Combine two result dictionaries into a final severity category.
    Both inputs have structure: {"label": str, "score": float}
    Returns a dict with an `severity` string and numeric combined score.
    """
    t_score = float(text_res.get("score", 0.0))
    i_score = float(img_res.get("score", 0.0))
    # Simple weighted average: text 50%, image 50% (tweak as needed)
    combined = (t_score + i_score) / (2 if (t_score or i_score) else 1)
    if combined >= 0.75:
        severity = "High"
    elif combined >= 0.4:
        severity = "Medium"
    else:
        severity = "Low"
    return {"combined_score": round(combined, 3), "severity": severity}
