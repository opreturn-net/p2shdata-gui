import { readFileSync, writeFileSync } from 'fs';

import textLanguages from './textLanguages.json' assert { type: "json" };

async function setLanguagesJson() {
    let textLanguages_new;
    try {
        textLanguages_new = await JSON.parse(readFileSync('./textLanguages.json', 'utf8'));
        // get all keys from textLanguages_new.english
        const keys = Object.keys(textLanguages.english);
        if (textLanguages_new[textLanguages_new.selected_language] == undefined)
            textLanguages_new[textLanguages_new.selected_language] = {};
        // check if all keys are present in textLanguages_new.selected_language
        for (let i = 0; i < keys.length; i++) {
            if (textLanguages_new[textLanguages_new.selected_language][keys[i]] == undefined) {
                textLanguages_new[textLanguages_new.selected_language][keys[i]] = textLanguages.english[keys[i]];
            }
        }
        writeFileSync('./textLanguages.json', JSON.stringify(textLanguages_new));
    } catch (error) {
        writeFileSync('./textLanguages.json', JSON.stringify(textLanguages));
        textLanguages_new = textLanguages;
    }
    return textLanguages_new;
}

async function getLanguagesJSON() {
    return await JSON.parse(readFileSync('./textLanguages.json', 'utf8'));
}

export { setLanguagesJson, getLanguagesJSON }