import {
    getCharactersSettings,
    getLastResetDaily,
    getLastResetWeekly, loadSettings, saveSettings,
    setCharactersSettings,
    setLastResetDaily,
    setLastResetWeekly
} from "../utils/storage.js";

export function resetWeeklyActivities(DateTime) {
    let lastResetWeekly = getLastResetWeekly();
    const now = DateTime.now();

    if (lastResetWeekly) {
        let date = DateTime.fromISO(lastResetWeekly).plus({days: 7}).set({
            weekday: 3,
            hours: 6,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        });

        if (now < date) {
            return;
        }

        setLastResetWeekly(date.toISO());
    } else {
        let date = now.set({hours: 6, minutes: 0, seconds: 0, milliseconds: 0});

        if (now < date) {
            date = date.minus({days: 1});
        }

        setLastResetWeekly(date.toISO());
    }

    let charSettings = getCharactersSettings();
    Object.keys(charSettings).forEach(charName => {
        if (charSettings[charName]?.raids) {
            charSettings[charName].raids.forEach(raid => {
                if (["Эфонка", "Хранитель", "Хаос"].includes(raid)) {
                    return;
                }

                if (!charSettings[charName]?.raidStatus || !charSettings[charName]?.raidStatus?.[raid]) {
                    return;
                }

                charSettings[charName].raidStatus[raid] = "unfinished";
                if (!charSettings[charName]?.raidStatus[raid]?.phases) {
                    return;
                }

                for (let phase of Object.keys(charSettings[charName]?.raidStatus[raid]?.phases)) {
                    if (!charSettings[charName]?.raidStatus[raid]?.phases[phase]?.chestBought) {
                        continue;
                    }

                    charSettings[charName].raidStatus[raid].phases[phase].chestBought = false;
                }


                if (!charSettings[charName]?.customRaidPrices[raid]) {
                    return;
                }

                charSettings[charName].customRaidPrices[raid] = 0;
            });
        }
    });

    setCharactersSettings(charSettings);
}

export function resetDailyActivities(DateTime) {
    let lastResetDaily = getLastResetDaily();
    const now = DateTime.now();

    if (lastResetDaily) {
        let date = DateTime.fromISO(lastResetDaily).plus({days: 1}).set({
            hours: 6,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        });

        if (now < date) {
            return;
        }
        setLastResetDaily(date.toISO());
    } else {
        let date = now.set({hours: 6, minutes: 0, seconds: 0, milliseconds: 0});

        if (now < date) {
            date = date.minus({days: 1});
        }

        setLastResetDaily(date.toISO());
    }

    let charSettings = getCharactersSettings();
    Object.keys(charSettings).forEach(charName => {
        if (charSettings[charName]?.raids) {
            charSettings[charName].raids.forEach(raid => {
                if (["Эфонка", "Хранитель", "Хаос"].includes(raid)) {
                    charSettings[charName].raidStatus[raid] = "unfinished";
                }
            });
        }
    });

    setCharactersSettings(charSettings);

    const settings = loadSettings();
    settings.disableBossReminderToday = false;
    settings.disableChaosReminderToday = false;
    saveSettings(settings);
}