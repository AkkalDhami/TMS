export function getDueStatus(dueDateStr) {
    const now = new Date();
    const dueDate = new Date(dueDateStr);
    const diffMs = dueDate - now;
    const isOverdue = diffMs < 0;
    const diff = Math.abs(diffMs);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (isOverdue) {
        if (days === 0 && hours === 0) {
            return `❌ Overdue by ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (days === 0) {
            return `❌ Overdue by ${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            return `❌ Overdue by ${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    } else {
        if (days === 0 && hours === 0 && minutes <= 1) {
            return `🟡 Due very soon`;
        } else if (days === 0 && hours === 0) {
            return `🕐 Due in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (days === 0) {
            return `⏳ Due in ${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (days === 1) {
            return `📅 Due tomorrow (${hours}h ${minutes}m remaining)`;
        } else {
            return `📆 Due in ${days} days, ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    }
}
