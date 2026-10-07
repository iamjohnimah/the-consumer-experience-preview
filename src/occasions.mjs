export const occasions=['Everyday','Work','Date night','Dinner','Weekend','Workout','Wedding','Party','Special event','Brunch','Job interview','Evening'];
export function occasionMode(value){
 if(/workout|gym|fitness|training/i.test(value))return 'Active';
 if(/date|evening|cocktail|wedding|dinner|party|special event/i.test(value))return 'Evening';
 if(/work|interview|office/i.test(value))return 'Work';
 return 'Everyday';
}
