import { useState, useEffect } from "react";

export default function SelectDate({onDateChange}) {
    const months = ["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // adjust range as needed
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    
    function getDaysInMonth(y, mIndex) {
        return new Date(y, mIndex + 1, 0).getDate();
    }

    function availableDays() {
        if (!month || !year) return [];
        const mIndex = months.indexOf(month);
        const count = getDaysInMonth(year, mIndex);
        return Array.from({ length: count }, (_, i) => i + 1);
    }

    useEffect(() => {
        const days = availableDays();
        if (day && !days.includes(Number(day))) {
            setDay("");
        }
    }, [month, year]);

    function getDateObject() {
        // Return null if no date is selected
        if (!year) return null;
        
        const dateObj = { year: parseInt(year) };
        
        // Add month if selected (convert Albanian month name to number)
        if (month) {
        const monthIndex = months.indexOf(month) + 1;
            dateObj.month = monthIndex;
        }
        
        // Add day if selected
        if (day) {
            dateObj.day = parseInt(day);
        }
        
        return dateObj;
    }

    // Call the callback whenever the date changes
    useEffect(() => {
        if (onDateChange) {
            const dateObj = getDateObject();
            onDateChange(dateObj);
    }
    }, [day, month, year, onDateChange]);

    return (
        <div>
            <div className="flex gap-2 mt-2">
                {/* Day */}
                <select value={day} onChange={e => setDay(e.target.value)} className=" bg-gray-100 p-1 rounded-xl ">
                <option value="">Dita</option>
                    {availableDays().map(d => (
                <option key={d} value={d}>{d}</option>
                ))}
                </select>
                {/* Month */}
                <select value={month} onChange={e => setMonth(e.target.value)} className="bg-gray-100 p-1 rounded-xl">
                    <option value="">Muaji</option>
                    {months.map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                    ))}
                </select>
                {/* Year */}
                <select value={year} onChange={e => setYear(e.target.value)} className="bg-gray-100 p-1 rounded-xl">
                    <option value="">Viti</option>
                        {years.map((y, i) => (
                            <option key={i} value={y}>{y}</option>
                        ))}
                </select>
            </div>
    </div>
  );
}