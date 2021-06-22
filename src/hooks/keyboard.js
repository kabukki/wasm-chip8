import { useEffect } from 'react';

export function useKeyboard ({ onKeyup = () => {}, onKeydown = () => {} }) {
    // const [keys, setKeys] = useState([]);

    // const onKeydown = (e) => {
    //     setKeys((previous) => (previous.includes(e.key) ? [...previous] : [...previous, e.key]));
    // };

    // const onKeyup = ({ key }) => {
    //     setKeys((previous) => previous.filter((k) => k !== key));
    // };

    const _onKeyup = ({ key }) => onKeyup(key);
    const _onKeydown = ({ key }) => onKeydown(key);
    


    // // Run when keys identity changes (i.e. on every keydown/keyup event)
    // useEffect(() => {
    //     if (keys.length > 0) {
    //         onKey(keys);
    //     }
    // });
}
