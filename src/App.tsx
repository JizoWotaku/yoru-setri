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
  Checkbox,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Badge,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import DownloadIcon from "@mui/icons-material/Download";
import { SONG_LIST, LIVE_EVENTS } from "./constants";
import html2canvas from "html2canvas";

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
  const theme = useTheme();
  // スマホかどうかを判定
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // セットリストの状態
  const [items, setItems] = React.useState<SetlistItem[]>([]);

  // 日付の状態
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

  // 画像プレビューモーダルの状態
  const [openImageDialog, setOpenImageDialog] = React.useState(false);

  // 画像生成関連の状態
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // 日付が変わった時にライブ情報を検索してセットする
  React.useEffect(() => {
    const todaysLives = LIVE_EVENTS.filter((e) => e.date === dateStr);
    
    if (todaysLives.length > 0) {
      setSelectedLiveName(todaysLives[0].liveName);
      setIncludeLiveName(true);
    } else {
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
    
    const selectedEvent = LIVE_EVENTS.find(
      (e) => e.date === dateStr && e.liveName === selectedLiveName
    );

    const placePart = (includeLiveName && selectedEvent?.place) 
      ? `📍${selectedEvent.place}\n` 
      : " ";

    const formattedDate = `🗓️${parseInt(month)}/${parseInt(day)}${placePart}`;

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

    const liveNamePart = (includeLiveName && selectedLiveName) 
      ? `${selectedLiveName}\n\n` 
      : "";

    // ハッシュタグの前の改行調整
    return `${formattedDate}#キミそらセトリ\n\n${liveNamePart}${setlistText}\n\n#キミそら #君と見るそら`;
  }, [items, dateStr, includeLiveName, selectedLiveName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
      setOpenSnackbar(true);
    });
  };

  // 選択状態を取得する関数（バッジ表示用）
  const getSelectionInfo = (songTitle: string) => {
    const isSpecial = songTitle === "SE" || songTitle === "MC";
    let normalCount = 0;
    const indices: string[] = [];

    items.forEach((item) => {
      // MC/SE以外をカウント（プレビュー側のロジックと合わせる）
      if (item.name !== "SE" && item.name !== "MC") {
        normalCount++;
      }

      if (item.name === songTitle) {
        if (isSpecial) {
          indices.push("✔");
        } else {
          indices.push(String(normalCount));
        }
      }
    });

    if (indices.length === 0) return null;
    
    // SE/MCは連結（✔✔）、それ以外はカンマ区切り（1, 3）
    return isSpecial ? indices.join("") : indices.join(", ");
  };

  // 画像生成処理（プレビュー用）
  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    // 描画更新待ち
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.getElementById("setlist-image-card");
    if (!element) {
        setIsGenerating(false);
        return;
    }

    try {
        const canvas = await html2canvas(element, {
          scale: 2, 
          backgroundColor: null,
          useCORS: true, 
          logging: false,
        });
        setPreviewUrl(canvas.toDataURL("image/png"));
        setOpenImageDialog(true);
    } catch (error) {
        console.error("Image generation failed", error);
        alert("画像の生成に失敗しました。");
    } finally {
        setIsGenerating(false);
    }
  };

  // 画像保存処理
  const handleSaveImage = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `kimisora_setlist_${dateStr}.png`;
    link.click();
  };

  const todaysLives = LIVE_EVENTS.filter((e) => e.date === dateStr);
  const selectedEvent = LIVE_EVENTS.find(
    (e) => e.date === dateStr && e.liveName === selectedLiveName
  );

  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      {/* ヘッダー */}
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

      {/* ライブ情報選択エリア */}
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
                この日のライブ情報をセトリに含める
              </Typography>
            }
          />
          
          {includeLiveName && (
            <Box sx={{ mt: 1, ml: 3 }}>
              {todaysLives.length === 1 ? (
                <Typography variant="body1" sx={{ p: 0.5 }}>
                  {todaysLives[0].liveName}
                  {todaysLives[0].place && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      📍{todaysLives[0].place}
                    </Typography>
                  )}
                </Typography>
              ) : (
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
                        label={
                          <Box component="span">
                            {live.liveName}
                            {live.place && (
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                📍{live.place}
                              </Typography>
                            )}
                          </Box>
                        }
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
        
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => {
              const selectionInfo = getSelectionInfo(song.title);
              return (
                <Badge 
                  key={song.title} 
                  badgeContent={selectionInfo} 
                  color="secondary"
                  invisible={!selectionInfo}
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      right: 5, 
                      top: 5, 
                      fontSize: '0.75rem',
                      height: 'auto',
                      minWidth: '20px',
                      px: 0.5,
                      py: 0.2
                    } 
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => addSong(song.title)}
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 10 }}
                  >
                    {song.title}
                  </Button>
                </Badge>
              );
            })
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
          rows={12}
          variant="outlined"
          sx={{ mb: 2, bgcolor: "white" }}
          InputProps={{ readOnly: true }}
        />
        
        {/* スマホの場合は縦積み、PCの場合は横並び */}
        <Stack direction={isMobile ? "column" : "row"} spacing={2} justifyContent="center">
           <Button
            variant="outlined"
            color="secondary"
            startIcon={isGenerating ? <CircularProgress size={20} /> : <ImageIcon />}
            onClick={handleGeneratePreview}
            fullWidth
            size="large"
            disabled={items.length === 0 || isGenerating}
          >
            {isGenerating ? "生成中..." : "画像生成"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TwitterIcon />}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweetText
            )}`}
            fullWidth
            size="large"
            sx={{ fontWeight: "bold" }}
          >
            ツイート
          </Button>
           <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            fullWidth
            size="large"
          >
            コピー
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

      {/* 隠し描画エリア（画像生成元） */}
      <Box sx={{ position: "fixed", top: 0, left: "-2000px", zIndex: -1 }}>
        <Paper
            id="setlist-image-card"
            elevation={0}
            sx={{
                width: "600px", 
                minWidth: "600px",
                minHeight: "600px",
                p: 5,
                borderRadius: 4,
                background: "linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)",
                position: "relative",
                overflow: "hidden",
                boxSizing: 'border-box'
            }}
            >
            {/* 装飾 */}
            <Box
                sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.4)",
                }}
            />
            <Box
                sx={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 150,
                height: 150,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.4)",
                }}
            />

            {/* コンテンツ */}
            <Box sx={{ position: "relative", zIndex: 1, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: "#0277bd", fontWeight: "bold", mb: 0.5, letterSpacing: 2 }}>
                {dateStr.replace(/-/g, '.')}
                </Typography>
                
                {includeLiveName && selectedLiveName && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: "900", color: "#424242", lineHeight: 1.3 }}>
                    {selectedLiveName}
                    </Typography>
                    {includeLiveName && selectedEvent?.place && (
                        <Typography variant="h6" sx={{ color: "#757575", mt: 1, fontWeight: 'normal' }}>
                        @ {selectedEvent.place}
                        </Typography>
                    )}
                </Box>
                )}
                
                <Box sx={{ width: '60%', height: '3px', bgcolor: 'primary.main', mx: 'auto', mb: 4, opacity: 0.6, borderRadius: 2 }} />

                <Stack spacing={2} sx={{ textAlign: 'left', mx: 4 }}>
                {items.map((item, index) => {
                    const isSpecial = item.name === "MC" || item.name === "SE";
                    let count = 0;
                    for(let i=0; i<index; i++) {
                        if(items[i].name !== "MC" && items[i].name !== "SE") count++;
                    }
                    const displayNum = isSpecial ? "" : `${String(count + 1).padStart(2, '0')}.`;

                    return (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography 
                        sx={{ 
                            width: '40px', 
                            fontWeight: '900', 
                            color: 'primary.main',
                            fontSize: isSpecial ? '1rem' : '1.4rem',
                            mr: 1,
                            textAlign: 'right',
                            fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
                        }}
                        >
                        {displayNum}
                        </Typography>
                        <Typography 
                        sx={{ 
                            fontWeight: isSpecial ? 'normal' : 'bold',
                            color: isSpecial ? 'text.secondary' : 'text.primary',
                            fontSize: isSpecial ? '1.1rem' : '1.5rem',
                            lineHeight: 1.2
                        }}
                        >
                        {item.name}
                        </Typography>
                    </Box>
                    );
                })}
                </Stack>
                
                <Box sx={{ mt: 5, pt: 2, borderTop: '2px dashed #bdbdbd' }}>
                <Typography variant="body1" sx={{ color: "#757575", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontWeight: 'bold' }}>
                    <TwitterIcon fontSize="inherit" /> #キミそらセトリ
                </Typography>
                </Box>
            </Box>
        </Paper>
      </Box>

      {/* 画像プレビュー用ダイアログ */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="body"
      >
        <DialogTitle>画像を保存してシェア！</DialogTitle>
        <DialogContent 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                bgcolor: '#f5f5f5', 
                p: isMobile ? 2 : 4 
            }}
        >
            <Typography variant="caption" sx={{ mb: 2, textAlign: 'center' }}>
                {isMobile 
                  ? "画像を長押しして保存してください" 
                  : "※保存ボタンが効かない場合は画像を長押しして保存してください"}
            </Typography>

            {previewUrl ? (
                <img 
                    src={previewUrl} 
                    alt="Setlist Preview" 
                    style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        borderRadius: '8px'
                    }} 
                />
            ) : (
                <CircularProgress />
            )}

        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Stack direction="column" spacing={2} width="100%">
            {/* スマホの場合は保存ボタンを表示しない */}
            {!isMobile && (
              <Button 
                  variant="contained" 
                  onClick={handleSaveImage}
                  startIcon={<DownloadIcon />}
                  size="large"
                  fullWidth
                  sx={{ borderRadius: 10, fontWeight: 'bold', py: 1.5 }}
              >
                  画像を保存
              </Button>
            )}
            <Button onClick={() => setOpenImageDialog(false)} fullWidth sx={{ color: 'text.secondary' }}>
                閉じる
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Container>
  );
}