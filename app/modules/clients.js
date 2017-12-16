const add = (clients, client) => {
    return clients.concat([client]);
}

const remove = (clients, client) => {
    return clients.filter(c => c !== client);
}

export {
    add,
    remove
};