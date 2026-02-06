export async function registerPuntori(formData){
    const res = await window.api.registerPuntori(formData)
    return res;
}

export async function getAllPuntor(){
    const res = await window.api.getAllPuntor();
    return res;
}

export async function addProdukt(formData){
    const res = await window.api.addProdukt(formData);
    return res;
}

export async function addPllake(formData){
    const res = await window.api.addPllake(formData);
    return res;
}

export async function getTodayProdukt(){
    const rows = await window.api.getTodayProdukt();
    return rows;
}