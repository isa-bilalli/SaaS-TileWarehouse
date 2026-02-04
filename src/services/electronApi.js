export async function testPing(){
    const res = await window.api.ping();
    console.log(res);
    return null;
}

export async function registerPuntori(formData){
    const res = await window.api.registerPuntori(formData)
    return res;
}

export async function getAllPuntor(){
    const res = await window.api.getAllPuntor();
    return res;
}