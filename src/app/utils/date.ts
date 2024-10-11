const timezone = 'Europe/Vienna';

export function formatDate(date: Date) {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: timezone });

    if (isToday) {
        return `Today at ${timeString}`;
    }

    if (isYesterday) {
        return `Yesterday at ${timeString}`;
    }

    const dateString = date.toLocaleDateString('de-DE', { timeZone: timezone });
    return `${dateString} ${timeString}`;
}
