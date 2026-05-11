import logo from './logo.svg';
import './App.css';
import LoginButton from './components/login';
import LogoutButton from './components/logout';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';

const clientId = '519370915513-obf9totlbq75hubskg9ececsltbmmbd5.apps.googleusercontent.com';

function App() {

    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: clientId,
                scope: ""
            })
        };

        gapi.load('client:auth2', start);

    });

    return (
        <div className="App">
            <LoginButton />
            <LogoutButton />
        </div>
    );
}

const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
};

export default App;