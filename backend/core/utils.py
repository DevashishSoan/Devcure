from typing import Optional

def format_mttr(seconds: Optional[float]) -> str:
    """Formats MTTR seconds into a human-readable string like '3m 12s'."""
    if seconds is None or seconds <= 0:
        return "—"
    
    if seconds < 60:
        return f"{int(seconds)}s"
        
    minutes = int(seconds // 60)
    remaining_seconds = int(seconds % 60)
    
    if remaining_seconds == 0:
        return f"{minutes}m"
        
    return f"{minutes}m {remaining_seconds:02d}s"
