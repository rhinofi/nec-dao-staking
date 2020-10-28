import { createMuiTheme } from '@material-ui/core/styles';

export const NectarTheme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 4,
      },
      outlined: {
        padding: '10px 20px'
      }
    },
    MuiTypography: {
      h2:{
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: '40px',
        lineHeight: '140%',
        letterSpacing: '-0.02em'
      },
      h3: {
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: '32px',
        lineHeight: '140%',
        letterSpacing: '-0.02em'
      },
      h4:{
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: '20px',
        letterSpacing: '-0.02em',
      },
      subtitle1: {
        fontFamily: 'Sen',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: '24px',
        lineHeight: '140%',
        letterSpacing: '-0.02em'
      },
      subtitle2: {
        fontFamily: 'Nunito',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '20px',
        lineHeight: '28px',
        textAlign: 'center'
      },
      body1: {
        fontFamily: 'Sen',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '18px',
        lineHeight: '28px'
      },
      body2: {
        fontFamily: 'Sen',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '16px',
        lineHeight: '24px'
      },
      paragraph: {
        fontFamily: 'Sen',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '14px',
        lineHeight: '150%',
        textAlign: 'center'
      },
      h6: {
        fontFamily: 'Sen',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 11,
        lineHeight: '150%',
        textTransform: 'uppercase'
      }
    }
  },
  palette: {
    primary: {
      main: '#F2994A',
      
    },
    secondary:{
     main:'#162131'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A9ABCB',
      hint: '#646A7A'
    }
  }
});