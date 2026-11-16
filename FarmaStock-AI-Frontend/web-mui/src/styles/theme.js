import { createTheme, alpha } from '@mui/material/styles';
export const palette = {
  navy: '#102B38', deep: '#10212C', green: '#16836B', lime: '#BAF2C8', mint: '#E8F6EF', text: '#203541', muted: '#7B8C95', bg: '#F5F7F8', border: '#E8EDEF', orange: '#E79E50'
};
const theme = createTheme({
  palette: { mode:'light', primary:{main:palette.green,contrastText:'#fff'}, secondary:{main:palette.navy}, background:{default:palette.bg,paper:'#fff'}, text:{primary:palette.text,secondary:palette.muted}, divider:palette.border, success:{main:'#17956C'}, warning:{main:'#E69A36'}, error:{main:'#D65A5A'} },
  shape:{borderRadius:14},
  typography:{fontFamily:'Manrope, Arial, sans-serif',h4:{fontWeight:800,letterSpacing:'-0.045em'},h5:{fontWeight:800,letterSpacing:'-0.035em'},h6:{fontWeight:800,letterSpacing:'-0.025em'},subtitle1:{fontWeight:700},button:{textTransform:'none',fontWeight:800,letterSpacing:'0.005em'}},
  components:{
    MuiCssBaseline:{styleOverrides:{body:{backgroundColor:palette.bg},'::-webkit-scrollbar':{width:'9px',height:'7px'},'::-webkit-scrollbar-thumb':{background:'#D7E1E2',borderRadius:10}}},
    MuiButton:{defaultProps:{disableElevation:true},styleOverrides:{root:{borderRadius:10,padding:'9px 18px'},containedPrimary:{background:'#16836B','&:hover':{background:'#106C58'}}}},
    MuiPaper:{styleOverrides:{root:{backgroundImage:'none'}}},
    MuiCard:{styleOverrides:{root:{border:'1px solid #E8EDEF',boxShadow:'0 5px 24px rgba(22,50,56,0.035)',borderRadius:18}}},
    MuiOutlinedInput:{styleOverrides:{root:{borderRadius:10,background:'#fff'}}},
    MuiTableCell:{styleOverrides:{head:{fontWeight:800,color:'#7B8C95',fontSize:'0.73rem',letterSpacing:'0.055em',textTransform:'uppercase',borderBottom:'1px solid #EDF1F2'},body:{fontSize:'0.83rem',borderBottom:'1px solid #F0F3F4'}}},
    MuiChip:{styleOverrides:{root:{fontWeight:800}}},
    MuiDialog:{styleOverrides:{paper:{borderRadius:20}}},
    MuiTabs:{styleOverrides:{indicator:{borderRadius:'5px 5px 0 0',height:3}}},
  }
});
export default theme;
