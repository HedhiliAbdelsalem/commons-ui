/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';

import TopBar from '../../src/components/TopBar';
import SnackbarProvider from '../../src/components/SnackbarProvider';

import {
    createMuiTheme,
    makeStyles,
    ThemeProvider,
} from '@material-ui/core/styles';
import AuthenticationRouter from '../../src/components/AuthenticationRouter';
import {
    initializeAuthenticationDev,
    logout,
} from '../../src/utils/AuthService';
import { useRouteMatch } from 'react-router';
import { IntlProvider } from 'react-intl';

import { BrowserRouter, useHistory, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { top_bar_en, top_bar_fr, login_fr, login_en } from '../../src/index';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import PowsyblLogo from '-!@svgr/webpack!../images/powsybl_logo.svg';

import { LIGHT_THEME } from '../../src/components/TopBar/TopBar';

const messages = {
    en: { ...login_en, ...top_bar_en },
    fr: { ...login_fr, ...top_bar_fr },
};

const language = navigator.language.split(/[-_]/)[0]; // language without region code

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
});

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const getMuiTheme = (theme) => {
    if (theme === LIGHT_THEME) {
        return lightTheme;
    } else {
        return darkTheme;
    }
};

const useStyles = makeStyles((theme) => ({
    success: {
        backgroundColor: '#43a047',
    },
    error: {
        backgroundColor: '#d32f2f',
    },
    warning: {
        backgroundColor: '#ffa000',
    },
}));

const MyButton = (props) => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    return (
        <Button
            variant="contained"
            className={classes[props.variant]}
            style={{ float: 'left', color: '#fff', margin: '5px' }}
            onClick={() => {
                enqueueSnackbar(props.message, { variant: props.variant });
            }}
        >
            {props.variant}
        </Button>
    );
};

const AppContent = () => {
    const history = useHistory();
    const location = useLocation();

    const [userManager, setUserManager] = useState({
        instance: null,
        error: null,
    });
    const [user, setUser] = useState(null);

    const [theme, setTheme] = useState(LIGHT_THEME);

    const [equipmentLabelling, setEquipmentLabelling] = useState(false);

    // Can't use lazy initializer because useRouteMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useRouteMatch({
            path: '/silent-renew-callback',
            exact: true,
        })
    );

    const dispatch = (e) => {
        if (e.type === 'USER') {
            setUser(e.user);
        }
    };

    const handleThemeClick = (theme) => {
        setTheme(theme);
    };

    const handleEquipmentLabellingClick = (labelling) => {
        setEquipmentLabelling(labelling);
    };

    const apps = [
        { name: 'App1', url: '/app1', appColor: 'red' },
        { name: 'App2', url: '/app2' },
    ];

    const buttons = [
        {
            variant: 'success',
            message: 'Successfully done the operation.',
            id: 'button1',
        },
        { variant: 'error', message: 'Something went wrong.', id: 'button2' },
    ];

    useEffect(() => {
        initializeAuthenticationDev(
            dispatch,
            initialMatchSilentRenewCallbackUrl != null
        )
            .then((userManager) => {
                setUserManager({ instance: userManager, error: null });
                userManager.signinSilent();
            })
            .catch(function (error) {
                setUserManager({ instance: null, error: error.message });
                console.debug('error when creating userManager');
            });
        // Note: initialMatchSilentRenewCallbackUrl doesn't change
    }, [initialMatchSilentRenewCallbackUrl]);

    return (
        <IntlProvider locale={language} messages={messages[language]}>
            <ThemeProvider theme={getMuiTheme(theme)}>
                <SnackbarProvider hideIconVariant={false}>
                    <CssBaseline />
                    <TopBar
                        appName="Demo"
                        appColor="#808080"
                        appLogo=<PowsyblLogo />
                        onParametersClick={() => console.log('settings')}
                        onLogoutClick={() =>
                            logout(dispatch, userManager.instance)
                        }
                        onLogoClick={() => console.log('logo')}
                        onThemeClick={handleThemeClick}
                        theme={theme}
                        onAboutClick={() => console.log('about')}
                        onEquipmentLabellingClick={
                            handleEquipmentLabellingClick
                        }
                        equipmentLabelling={equipmentLabelling}
                        user={user}
                        appsAndUrls={apps}
                    >
                        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                            foobar-bazfoobar
                        </div>
                        <div style={{ flexGrow: 1 }}></div>
                        <div>baz</div>
                    </TopBar>
                    {user !== null ? (
                        <Box mt={20}>
                            <Typography
                                variant="h3"
                                color="textPrimary"
                                align="center"
                            >
                                Connected
                            </Typography>
                        </Box>
                    ) : (
                        <AuthenticationRouter
                            userManager={userManager}
                            signInCallbackError={null}
                            dispatch={dispatch}
                            history={history}
                            location={location}
                        />
                    )}
                    {buttons.map((button) => (
                        <MyButton {...button} key={button.id} />
                    ))}
                </SnackbarProvider>
            </ThemeProvider>
        </IntlProvider>
    );
};

const App = () => {
    return (
        <BrowserRouter basename={'/'}>
            <AppContent />
        </BrowserRouter>
    );
};

export default App;
