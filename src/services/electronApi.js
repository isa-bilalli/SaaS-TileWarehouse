export async function testPing(){
    const res = await window.api.ping();
    console.log(res);
    return null;
}