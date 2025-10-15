// utils/dateTime.js
export function getCurrentDateTime(timezone = process.env.TIMEZONE || "UTC") {
    const now = new Date();

    // Format date as dd-MM-yyyy
    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const [{ value: day }, , { value: month }, , { value: year }] = dateFormatter.formatToParts(now);
    const date = `${day}-${month}-${year}`;

    // Format time as hh:mm AM/PM
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const time = timeFormatter.format(now);

    return { date, time };
}
