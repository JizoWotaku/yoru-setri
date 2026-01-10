import { createTheme } from '@mui/material/styles';
import { lightBlue, pink } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      // 空色をメインカラーに
      main: lightBlue[400], // #29b6f6
      contrastText: '#fff', // 文字色は白
    },
    secondary: {
      // アクセントに可愛らしいピンクを使用
      main: pink[300],
    },
    background: {
      default: '#f0f8ff', // 背景を薄いアリスブルーに
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 700,
      color: lightBlue[700], // タイトルを濃い青に
    },
  },
  components: {
    // ボタンを全体的に丸くする（Pill shape）
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none', // アルファベットの大文字変換を無効化
          fontWeight: 'bold',
        },
      },
    },
    // カード（Paper）の角も少し丸く
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;