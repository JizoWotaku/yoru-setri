import * as React from "react";
import {
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  Alert,
  Snackbar,
  InputAdornment,
  Checkbox,       // 追加
  FormControl,    // 追加
  FormControlLabel, // 追加
  Radio,          // 追加
  RadioGroup,     // 追加
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import { SONG_LIST, LIVE_EVENTS } from "./constants"; // LIVE_EVENTSを追加インポート

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  });

  // ライブ選択の状態
  const [selectedLiveName, setSelectedLiveName] = React.useState("");
  const [includeLiveName, setIncludeLiveName] = React.useState(false);

  // 自由入力用の状態
  const [customSong, setCustomSong] = React.useState("");
  
  // 検索フィルター用の状態
  const [filterText, setFilterText] = React.useState("");

  // コピー完了通知用
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  // 日付が変わった時にライブ情報を検索してセットする
  React.useEffect(() => {
    // 選択された日付にマッチするライブを検索
    const todaysLives = LIVE_EVENTS.filter((e) => e.date === dateStr);
    
    if (todaysLives.length > 0) {
      // ライブがある場合、デフォルトで1つ目を選択し、チェックを入れる
      setSelectedLiveName(todaysLives[0].liveName);
      setIncludeLiveName(true);
    } else {
      // ライブがない場合、リセット
      setSelectedLiveName("");
      setIncludeLiveName(false);
    }
  }, [dateStr]);

  // フィルタリングされた楽曲リスト
  const filteredSongs = React.useMemo(() => {
    if (!filterText) return SONG_LIST;
    const lowerFilter = filterText.toLowerCase();
    return SONG_LIST.filter((song) => song.keywords.includes(lowerFilter));
  }, [filterText]);

  const addSong = (name: string) => {
    const newItem: SetlistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeSong = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const resetRows = () => {
    if (window.confirm("セットリストをリセットしますか？")) {
      setItems([]);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  // ツイート用テキストの自動生成
  const tweetText = React.useMemo(() => {
    const [year, month, day] = dateStr.split("-");
    const formattedDate = `🗓️${parseInt(month)}/${parseInt(day)}`;

    let songCount = 0;
    const setlistText = items
      .map((item) => {
        if (item.name === "SE" || item.name === "MC") {
          return item.name;
        } else {
          songCount++;
          return `${songCount}. ${item.name}`;
        }
      })
      .join("\n");

    // ライブ名を含めるかどうかの処理
    const liveNamePart = (includeLiveName && selectedLiveName) 
      ? `${selectedLiveName}\n\n` 
      : "";

    return `${formattedDate} #キミそらセトリ\n\n${liveNamePart}${setlistText}\n\n#キミそら #君と見るそら`;
  }, [items, dateStr, includeLiveName, selectedLiveName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
      setOpenSnackbar(true);
    });
  };

  // 現在の日付に対応するライブ情報のリストを取得（レンダリング用）
  const todaysLives = LIVE_EVENTS.filter((e) => e.date === dateStr);

  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      {/* ヘッダー・日付選択 */}
      <Box
        sx={{
          my: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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

      {/* ★追加：ライブ情報選択エリア */}
      {todaysLives.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#e3f2fd", borderColor: "#90caf9" }} variant="outlined">
          <FormControlLabel
            control={
              <Checkbox 
                checked={includeLiveName}
                onChange={(e) => setIncludeLiveName(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="subtitle1" fontWeight="bold">
                この日のライブ名をセトリに含める
              </Typography>
            }
          />
          
          {includeLiveName && (
            <Box sx={{ mt: 1, ml: 3 }}>
              {todaysLives.length === 1 ? (
                // ライブが1つの場合はテキスト表示のみ
                <Typography variant="body1" sx={{ p: 0.5 }}>
                  {todaysLives[0].liveName}
                </Typography>
              ) : (
                // ライブが複数の場合はラジオボタンで選択
                <FormControl component="fieldset">
                  <RadioGroup
                    value={selectedLiveName}
                    onChange={(e) => setSelectedLiveName(e.target.value)}
                  >
                    {todaysLives.map((live, idx) => (
                      <FormControlLabel 
                        key={idx}
                        value={live.liveName}
                        control={<Radio size="small" />}
                        label={live.liveName}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* 楽曲ボタンエリア */}
      <Paper sx={{ p: 2, mb: 4 }} variant="outlined">
        <Box sx={{ mb: 2 }}>
          <TextField
            label="楽曲を検索（ひらがな・ローマ字OK）"
            variant="standard"
            fullWidth
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          タップして追加
        </Typography>
        
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <Button
                key={song.title}
                variant="outlined"
                size="small"
                onClick={() => addSong(song.title)}
                startIcon={<AddIcon />}
                sx={{ borderRadius: 10 }}
              >
                {song.title}
              </Button>
            ))
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ width: '100%', textAlign: 'center', py: 2 }}>
              見つかりませんでした。<br/>下の入力欄から追加できます。
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
          <TextField
            label="リストにない曲を追加"
            size="small"
            fullWidth
            value={customSong}
            onChange={(e) => setCustomSong(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && customSong) {
                addSong(customSong);
                setCustomSong("");
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              if (customSong) {
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 1,
          }}
        >
          <Typography variant="h6">作成リスト</Typography>
          <Button
            color="error"
            size="small"
            onClick={resetRows}
            disabled={items.length === 0}
          >
            リセット
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={2}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="setlist-droppable">
              {(provided) => (
                <Table
                  size="small"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ py: 4, color: "text.secondary" }}
                        >
                          曲がまだありません。
                          <br />
                          上のボタンから追加してください。
                        </TableCell>
                      </TableRow>
                    )}
                    {items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              backgroundColor: snapshot.isDragging
                                ? "#f5f5f5"
                                : "inherit",
                              display: snapshot.isDragging
                                ? "table"
                                : undefined,
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
                              <IconButton
                                size="small"
                                onClick={() => removeSong(index)}
                              >
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
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweetText
            )}`}
            fullWidth
            sx={{ fontWeight: "bold" }}
          >
            ツイート
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          コピーしました！
        </Alert>
      </Snackbar>
    </Container>
  );
}