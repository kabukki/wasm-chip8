export const suspend = (promise) => {
    let status = 'pending';
    let response;

    const suspender = promise
        .then((data) => {
            response = data;
            status = 'success';
        })
        .catch((err) => {
            response = err;
            status = 'error';
        });
    
    return () => {
        if (status === 'pending') {
            throw suspender;
        } else if (status === 'error') {
            throw response;
        } else if (status === 'success') {
            return response;
        }
    };
}

export const hex = (num) => `0x${num.toString(16).padStart(4, '0')}`;
