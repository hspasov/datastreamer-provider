const add = (clients, client) => {
    return clients.concat([client]);
}

const remove = (clients, id) => {
    return clients.filter(c => c.id !== id);
}

const toggleReadable = (clients, id) => {
    return clients.map(c => {
        if (c.id !== id) {
            return c;
        } else {
            return {
                ...c,
                readable: !c.readable
            };
        }
    });
}

const toggleWritable = (clients, id) => {
    return clients.map(c => {
        if (c.id !== id) {
            return c;
        } else {
            return {
                ...c,
                writable: !c.writable
            };
        }
    });
}

export {
    add,
    remove,
    toggleReadable,
    toggleWritable
};