/***
 * THIS HTTP SERVICE IS ONLY USED FOR HARDWARE WALLET CONNECTIONS
 *
 */

export const get = async route => {
    return Promise.race([
        fetch(route).then(res => res.json()).catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 60000))
    ])
}

export const post = async (route, data) => {
    return Promise.race([
        fetch(route, {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 120000))
    ])
};