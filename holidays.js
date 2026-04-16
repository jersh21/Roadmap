// holidays.js

class HolidayCalculator {
    constructor(year) {
        this.year = year;
    }

    // Helper: Nth Day of a Given Month (e.g., 3rd Monday of Jan)
    // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    getNthDayOfMonth(month, dayOfWeek, n) {
        let date = new Date(this.year, month, 1);
        let count = 0;
        
        while (date.getMonth() === month) {
            if (date.getDay() === dayOfWeek) {
                count++;
                if (count === n) {
                    return new Date(date);
                }
            }
            date.setDate(date.getDate() + 1);
        }
        return null;
    }

    // Helper: Last Day of a Given Month (e.g., Last Monday of May)
    getLastDayOfMonth(month, dayOfWeek) {
        let date = new Date(this.year, month + 1, 0); // Last day of the current month
        
        while (date.getMonth() === month) {
            if (date.getDay() === dayOfWeek) {
                return new Date(date);
            }
            date.setDate(date.getDate() - 1);
        }
        return null;
    }

    // Helper: Computes Easter Sunday using Computus (Meeus/Jones/Butcher algorithm)
    getEaster() {
        const y = this.year;
        const a = y % 19;
        const b = Math.floor(y / 100);
        const c = y % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed month
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        
        return new Date(this.year, month, day);
    }

    getGoodFriday() {
        const easter = this.getEaster();
        const pd = new Date(easter);
        pd.setDate(pd.getDate() - 2);
        return pd;
    }

    getOrthodoxEaster() {
        const y = this.year;
        const a = y % 4;
        const b = y % 7;
        const c = y % 19;
        const d = (19 * c + 15) % 30;
        const e = (2 * a + 4 * b - d + 34) % 7;
        let month = Math.floor((d + e + 114) / 31) - 1;
        let day = ((d + e + 114) % 31) + 1;
        const date = new Date(y, month, day);
        date.setDate(date.getDate() + 13);
        return date;
    }

    getJapaneseVernalEquinox() {
        let day = Math.floor(20.8431 + 0.242194 * (this.year - 1980) - Math.floor((this.year - 1980) / 4));
        return new Date(this.year, 2, day);
    }

    getJapaneseAutumnalEquinox() {
        let day = Math.floor(23.2488 + 0.242194 * (this.year - 1980) - Math.floor((this.year - 1980) / 4));
        return new Date(this.year, 8, day);
    }

    getHolidays(region = 'US') {
        let holidays = [];
        
        if (region === 'CUSTOM') {
            const saved = localStorage.getItem('roadmap-custom-holidays');
            if (saved) {
                try {
                    const customList = JSON.parse(saved);
                    holidays = customList.map(h => ({
                        name: h.name,
                        date: new Date(this.year, h.month - 1, h.day)
                    }));
                } catch(e) {}
            }
        } else if (region === 'JP') {
            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Coming of Age Day", date: this.getNthDayOfMonth(0, 1, 2) },
                { name: "National Foundation Day", date: new Date(this.year, 1, 11) },
                ...(this.year >= 2020 ? [{ name: "Emperor's Birthday", date: new Date(this.year, 1, 23) }] : []),
                { name: "Vernal Equinox Day", date: this.getJapaneseVernalEquinox() },
                { name: "Showa Day", date: new Date(this.year, 3, 29) },
                { name: "Constitution Memorial Day", date: new Date(this.year, 4, 3) },
                { name: "Greenery Day", date: new Date(this.year, 4, 4) },
                { name: "Children's Day", date: new Date(this.year, 4, 5) },
                { name: "Marine Day", date: this.getNthDayOfMonth(6, 1, 3) },
                { name: "Mountain Day", date: new Date(this.year, 7, 11) },
                { name: "Respect for the Aged Day", date: this.getNthDayOfMonth(8, 1, 3) },
                { name: "Autumnal Equinox Day", date: this.getJapaneseAutumnalEquinox() },
                { name: "Health and Sports Day", date: this.getNthDayOfMonth(9, 1, 2) },
                { name: "Culture Day", date: new Date(this.year, 10, 3) },
                { name: "Labor Thanksgiving Day", date: new Date(this.year, 10, 23) }
            ];
        } else if (region === 'UK') {
            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Good Friday", date: this.getGoodFriday() },
                { name: "Easter Sunday", date: this.getEaster() },
                { name: "Easter Monday", date: new Date(this.getEaster().setDate(this.getEaster().getDate() + 1)) },
                { name: "Early May Bank Holiday", date: this.getNthDayOfMonth(4, 1, 1) }, // 1st Mon in May
                { name: "Spring Bank Holiday", date: this.getLastDayOfMonth(4, 1) },     // Last Mon in May
                { name: "Summer Bank Holiday", date: this.getLastDayOfMonth(7, 1) },     // Last Mon in Aug
                { name: "Halloween", date: new Date(this.year, 9, 31) },
                { name: "Guy Fawkes Night", date: new Date(this.year, 10, 5) },
                { name: "Christmas Eve", date: new Date(this.year, 11, 24) },
                { name: "Christmas Day", date: new Date(this.year, 11, 25) },
                { name: "Boxing Day", date: new Date(this.year, 11, 26) },
                { name: "New Year's Eve", date: new Date(this.year, 11, 31) }
            ];
        } else if (region === 'GR') {
            const orthEaster = this.getOrthodoxEaster();
            const cleanMon = new Date(orthEaster);
            cleanMon.setDate(cleanMon.getDate() - 48);
            const holySpirit = new Date(orthEaster);
            holySpirit.setDate(holySpirit.getDate() + 50);

            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Epiphany", date: new Date(this.year, 0, 6) },
                { name: "Clean Monday", date: cleanMon },
                { name: "Independence Day", date: new Date(this.year, 2, 25) },
                { name: "Orthodox Good Friday", date: new Date(orthEaster.getTime() - 2 * 86400000) },
                { name: "Orthodox Easter Sunday", date: orthEaster },
                { name: "Orthodox Easter Monday", date: new Date(orthEaster.getTime() + 86400000) },
                { name: "Labour Day", date: new Date(this.year, 4, 1) },
                { name: "Holy Spirit Monday", date: holySpirit },
                { name: "Dormition of the Virgin Mary", date: new Date(this.year, 7, 15) },
                { name: "Ochi Day", date: new Date(this.year, 9, 28) },
                { name: "Christmas Day", date: new Date(this.year, 11, 25) },
                { name: "Synaxis of the Mother of God", date: new Date(this.year, 11, 26) }
            ];
        } else if (region === 'CN') {
            const cnLunar = {
                2024: { cny: [1, 10], dragon: [5, 10], midAutumn: [8, 17] },
                2025: { cny: [0, 29], dragon: [4, 31], midAutumn: [9, 6] },
                2026: { cny: [1, 17], dragon: [5, 19], midAutumn: [8, 25] },
                2027: { cny: [1, 6], dragon: [5, 9], midAutumn: [8, 15] },
                2028: { cny: [0, 26], dragon: [4, 28], midAutumn: [9, 3] },
                2029: { cny: [1, 13], dragon: [5, 16], midAutumn: [8, 22] },
                2030: { cny: [1, 3], dragon: [5, 5], midAutumn: [8, 12] }
            };
            const cL = cnLunar[this.year] || { cny: [1, 1], dragon: [5, 1], midAutumn: [8, 1] };
            const qingming = Math.floor(4.81 + 0.2422 * (this.year - 2000) - Math.floor((this.year - 2000) / 4));

            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Spring Festival (Chinese New Year)", date: new Date(this.year, cL.cny[0], cL.cny[1]) },
                { name: "Qingming Festival", date: new Date(this.year, 3, qingming) },
                { name: "Labor Day", date: new Date(this.year, 4, 1) },
                { name: "Dragon Boat Festival", date: new Date(this.year, cL.dragon[0], cL.dragon[1]) },
                { name: "Mid-Autumn Festival", date: new Date(this.year, cL.midAutumn[0], cL.midAutumn[1]) },
                { name: "National Day", date: new Date(this.year, 9, 1) }
            ];
        } else if (region === 'DE') {
            const easter = this.getEaster();
            const ascDay = new Date(easter.getTime() + 39 * 86400000);
            const whitMon = new Date(easter.getTime() + 50 * 86400000);

            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Good Friday", date: this.getGoodFriday() },
                { name: "Easter Monday", date: new Date(easter.getTime() + 86400000) },
                { name: "Labour Day", date: new Date(this.year, 4, 1) },
                { name: "Ascension Day", date: ascDay },
                { name: "Whit Monday", date: whitMon },
                { name: "Day of German Unity", date: new Date(this.year, 9, 3) },
                { name: "Christmas Day", date: new Date(this.year, 11, 25) },
                { name: "Boxing Day (St. Stephen's Day)", date: new Date(this.year, 11, 26) }
            ];
        } else if (region === 'IN') {
            const inLunar = {
                2024: { holi: [2, 25], diwali: [9, 31] },
                2025: { holi: [2, 14], diwali: [9, 20] },
                2026: { holi: [2, 3], diwali: [10, 8] },
                2027: { holi: [2, 22], diwali: [9, 29] },
                2028: { holi: [2, 11], diwali: [9, 17] },
                2029: { holi: [1, 28], diwali: [10, 5] },
                2030: { holi: [2, 19], diwali: [9, 26] }
            };
            const iL = inLunar[this.year] || { holi: [2, 20], diwali: [10, 1] };

            holidays = [
                { name: "Republic Day", date: new Date(this.year, 0, 26) },
                { name: "Holi", date: new Date(this.year, iL.holi[0], iL.holi[1]) },
                { name: "Independence Day", date: new Date(this.year, 7, 15) },
                { name: "Mahatma Gandhi Jayanti", date: new Date(this.year, 9, 2) },
                { name: "Diwali", date: new Date(this.year, iL.diwali[0], iL.diwali[1]) },
                { name: "Christmas Day", date: new Date(this.year, 11, 25) }
            ];
        } else if (region === 'CA') {
            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Valentine's Day", date: new Date(this.year, 1, 14) },
                { name: "Family Day", date: this.getNthDayOfMonth(1, 1, 3) }, // 3rd Mon in Feb
                { name: "St. Patrick's Day", date: new Date(this.year, 2, 17) },
                { name: "Good Friday", date: this.getGoodFriday() },
                { name: "Easter Sunday", date: this.getEaster() },
                { name: "Easter Monday", date: new Date(this.getEaster().setDate(this.getEaster().getDate() + 1)) },
                { name: "Mother's Day", date: this.getNthDayOfMonth(4, 0, 2) },
                { name: "Victoria Day", date: (() => { let d = new Date(this.year, 4, 24); while(d.getDay() !== 1) d.setDate(d.getDate()-1); return d; })() },
                { name: "Father's Day", date: this.getNthDayOfMonth(5, 0, 3) },
                { name: "Canada Day", date: new Date(this.year, 6, 1) },
                { name: "Labour Day", date: this.getNthDayOfMonth(8, 1, 1) }, // 1st Mon in Sep
                { name: "Thanksgiving Day", date: this.getNthDayOfMonth(9, 1, 2) }, // 2nd Mon in Oct
                { name: "Halloween", date: new Date(this.year, 9, 31) },
                { name: "Remembrance Day", date: new Date(this.year, 10, 11) },
                { name: "Christmas Eve", date: new Date(this.year, 11, 24) },
                { name: "Christmas Day", date: new Date(this.year, 11, 25) },
                { name: "Boxing Day", date: new Date(this.year, 11, 26) },
                { name: "New Year's Eve", date: new Date(this.year, 11, 31) }
            ];
        } else {
            holidays = [
                { name: "New Year's Day", date: new Date(this.year, 0, 1) },
                { name: "Martin Luther King Jr. Day", date: this.getNthDayOfMonth(0, 1, 3) },
                { name: "Valentine's Day", date: new Date(this.year, 1, 14) },
                { name: "Presidents' Day", date: this.getNthDayOfMonth(1, 1, 3) },
                { name: "St. Patrick's Day", date: new Date(this.year, 2, 17) },
                { name: "Easter Sunday", date: this.getEaster() },
                { name: "Earth Day", date: new Date(this.year, 3, 22) },
                { name: "Cinco de Mayo", date: new Date(this.year, 4, 5) },
                { name: "Mother's Day", date: this.getNthDayOfMonth(4, 0, 2) },
                { name: "Memorial Day", date: this.getLastDayOfMonth(4, 1) },
                { name: "Juneteenth", date: new Date(this.year, 5, 19) },
                { name: "Father's Day", date: this.getNthDayOfMonth(5, 0, 3) },
                { name: "Independence Day", date: new Date(this.year, 6, 4) },
                { name: "Labor Day", date: this.getNthDayOfMonth(8, 1, 1) },
                { name: "Columbus Day", date: this.getNthDayOfMonth(9, 1, 2) },
                { name: "Halloween", date: new Date(this.year, 9, 31) },
                { name: "Veterans Day", date: new Date(this.year, 10, 11) },
                { name: "Thanksgiving Day", date: this.getNthDayOfMonth(10, 4, 4) },
                { name: "Christmas Eve", date: new Date(this.year, 11, 24) },
                { name: "Christmas Day", date: new Date(this.year, 11, 25) },
                { name: "New Year's Eve", date: new Date(this.year, 11, 31) }
            ];
        }

        return holidays.map(h => ({
            name: h.name,
            date: h.date,
            month: h.date.getMonth(), // 0-11
            day: h.date.getDate(),    // 1-31
            dateString: h.date.toDateString()
        }));
    }
}

// Ensure it can be globally accessed or module exported based on the environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = HolidayCalculator;
} else {
    window.HolidayCalculator = HolidayCalculator;
}
