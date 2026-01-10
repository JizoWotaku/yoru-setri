import * as React from "react";
import {
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TwitterIcon from "@mui/icons-material/Twitter";
import { MUSIC_LIST } from "./constants";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

// 型定義：IDを追加してユニーク性を担保
type SetlistItem = {
  id: string;
  name: string;
};

export default function App() {
  // セットリストの状態
  const [items, setItems] = React.useState<SetlistItem[]>([]);
  
  // 日付の状態（デフォルトは今日 YYYY-MM-DD形式）
  const [dateStr, setDateStr] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // 自由入力用の状態
  const [customSong, setCustomSong] = React.useState("");
  
  // コピー完了通知用
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  // 曲を追加する関数
  const addSong = (name: string) => {
    const newItem: SetlistItem = {
      // ランダムなIDを生成してkey重複を防ぐ（簡易的なID生成）
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // 1曲削除する関数
  const removeSong = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 全消去
  const resetRows = () => {
    if (window.confirm("セットリストをリセットしますか？")) {
      setItems([]);
    }
  };

  // ドラッグ＆ドロップ終了時の処理
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  // ツイート用テキストの自動生成 (useMemoを使用し、itemsかdateStrが変わった時だけ再計算)
  const tweetText = React.useMemo(() => {
    const [year, month, day] = dateStr.split("-");
    // 月日のフォーマット (0埋めを削除して自然な表記に)
    const formattedDate = `${parseInt(month)}/${parseInt(day)}`;
    
    let songCount = 0;
    const setlistText = items
      .map((item) => {
        if (item.name === "SE" || item.name === "MC") {
          // SEやMCはナンバリングしない
          return item.name;
        } else {
          songCount++;
          return `${songCount}. ${item.name}`;
        }
      })
      .join("\n");

    return `${formattedDate} #キミそらセトリ\n\n${setlistText}\n\n#キミそら #君と見るそら`;
  }, [items, dateStr]);

  // クリップボードにコピー
  const handleCopy = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
      setOpenSnackbar(true);
    });
  };

  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      {/* ヘッダー・日付選択 */}
      <Box sx={{ my: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          キミそらセトリ
        </Typography>
        <TextField
          label="日付"
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* 楽曲ボタンエリア */}
      <Paper sx={{ p: 2, mb: 4 }} variant="outlined">
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          タップして追加
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {MUSIC_LIST.map((song) => (
            <Button
              key={song}
              variant="outlined"
              size="small"
              onClick={() => addSong(song)}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 10 }}
            >
              {song}
            </Button>
          ))}
        </Box>
        {/* 自由入力エリア */}
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <TextField
            label="リストにない曲を追加"
            size="small"
            fullWidth
            value={customSong}
            onChange={(e) => setCustomSong(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customSong) {
                addSong(customSong);
                setCustomSong("");
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => {
              if(customSong) {
                addSong(customSong);
                setCustomSong("");
              }
            }}
            disabled={!customSong}
          >
            追加
          </Button>
        </Box>
      </Paper>

      {/* セットリスト表示エリア */}
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1 }}>
          <Typography variant="h6">作成リスト</Typography>
          <Button color="error" size="small" onClick={resetRows} disabled={items.length === 0}>
            リセット
          </Button>
        </Box>
        
        <TableContainer component={Paper} elevation={2}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="setlist-droppable">
              {(provided) => (
                <Table size="small" ref={provided.innerRef} {...provided.droppableProps}>
                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell align="center" sx={{ py: 4, color: "text.secondary" }}>
                          曲がまだありません。<br />上のボタンから追加してください。
                        </TableCell>
                      </TableRow>
                    )}
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              backgroundColor: snapshot.isDragging ? "#f5f5f5" : "inherit",
                              display: snapshot.isDragging ? "table" : undefined // レイアウト崩れ防止
                            }}
                          >
                            <TableCell 
                              width="40px" 
                              align="center"
                              {...provided.dragHandleProps} 
                              sx={{ color: "text.secondary", cursor: "grab" }}
                            >
                              <DragHandleIcon fontSize="small" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1">
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" width="50px">
                              <IconButton size="small" onClick={() => removeSong(index)}>
                                <DeleteIcon fontSize="small" color="action" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              )}
            </Droppable>
          </DragDropContext>
        </TableContainer>
      </Box>

      {/* アクションエリア */}
      <Paper sx={{ p: 2, mt: 4, bgcolor: "#f8f9fa" }} elevation={0}>
        <TextField
          label="ツイート内容プレビュー"
          value={tweetText}
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          sx={{ mb: 2, bgcolor: "white" }}
          InputProps={{ readOnly: true }}
        />
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            fullWidth
          >
            コピー
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TwitterIcon />}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
            fullWidth
            sx={{ fontWeight: "bold" }}
          >
            ツイート
          </Button>
        </Stack>
      </Paper>

      {/* 通知用スナックバー */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          コピーしました！
        </Alert>
      </Snackbar>
    </Container>
  );
}
