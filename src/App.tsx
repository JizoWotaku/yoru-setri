import * as React from "react";
import {
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Collapse,
  Grid,
  Badge,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TwitterIcon from "@mui/icons-material/Twitter";
import ImageIcon from "@mui/icons-material/Image";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { SONG_LIST, LIVE_EVENTS } from "./constants";
import html2canvas from "html2canvas";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

// --- Types ---
type SetlistItem = {
  id: string;
  name: string;
};

type SetlistGroup = {
  id: string;
  title: string;
  place: string;
  items: SetlistItem[];
};

type SavedState = {
    dateStr: string;
    groups: SetlistGroup[];
    activeGroupId: string;
    isInitialized: boolean;
};

// --- Constants ---
const STORAGE_KEY = 'kimisora_setlist_data_v2';
const ENCORE_NAME = "アンコール"; // リスト内の表示名かつ識別用
const ENCORE_DISPLAY = "Encore"; // 画像や画面上での装飾表示用

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --- Haptics Helper ---
  const triggerHaptic = () => {
      if (navigator.vibrate) {
          navigator.vibrate(40); // 40msの振動
      }
  };

  // --- Helpers ---
  const getTodayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // --- State Initialization with LocalStorage ---
  const loadState = (): SavedState | null => {
      try {
          const loaded = localStorage.getItem(STORAGE_KEY);
          if (loaded) {
              const parsed = JSON.parse(loaded);
              // 日付が変わっていたらリセット（ロードしない）
              if (parsed.dateStr !== getTodayStr()) {
                  return null;
              }
              return parsed;
          }
      } catch (e) {
          console.error("Failed to load state", e);
      }
      return null;
  };

  const savedState = loadState();

  const [isInitialized, setIsInitialized] = React.useState(savedState ? savedState.isInitialized : false);
  
  const [dateStr, setDateStr] = React.useState(() => {
    if (savedState) return savedState.dateStr;
    return getTodayStr();
  });

  const [groups, setGroups] = React.useState<SetlistGroup[]>(savedState ? savedState.groups : []);
  const [activeGroupId, setActiveGroupId] = React.useState<string>(savedState ? savedState.activeGroupId : "");

  // --- Auto Save ---
  React.useEffect(() => {
      const stateToSave: SavedState = {
          dateStr,
          groups,
          activeGroupId,
          isInitialized
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [dateStr, groups, activeGroupId, isInitialized]);

  // --- Input State ---
  const [inputValue, setInputValue] = React.useState("");
  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = React.useState(false);
  const [targetGroupId, setTargetGroupId] = React.useState<string | null>(null);
  
  // --- UI State ---
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [openImageDialog, setOpenImageDialog] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);
  
  const inputRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  const todaysLives = React.useMemo(() => {
    return LIVE_EVENTS.filter((e) => e.date === dateStr);
  }, [dateStr]);

  // --- Handlers: Start Screen ---
  const handleStart = (initialGroup: SetlistGroup) => {
    setGroups([initialGroup]);
    setActiveGroupId(initialGroup.id);
    setIsInitialized(true);
  };

  const handleResetToStart = () => {
    if (window.confirm("最初の画面に戻りますか？\n入力中の内容はリセットされます。")) {
      setIsInitialized(false);
      setGroups([]);
      setInputValue("");
      localStorage.removeItem(STORAGE_KEY); // Reset storage
      triggerHaptic();
    }
  };

  // --- Handlers: Editor ---
  const updateGroup = (groupId: string, updater: (g: SetlistGroup) => SetlistGroup) => {
    setGroups(prev => prev.map(g => g.id === groupId ? updater(g) : g));
  };

  const addSongToGroup = (groupId: string, nameToAdd: string) => {
    if (!nameToAdd || !nameToAdd.trim()) return;

    const newItem: SetlistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nameToAdd,
    };
    
    updateGroup(groupId, g => ({
      ...g,
      items: [...g.items, newItem]
    }));
    triggerHaptic(); // 追加時に振動
  };

  const handleOpenAddSongDialog = (groupId: string) => {
      setTargetGroupId(groupId);
      setInputValue("");
      setIsAddSongDialogOpen(true);
  };

  const handleSongAddition = (nameOverride?: string) => {
      const nameToAdd = nameOverride ?? inputValue;
      if (targetGroupId && nameToAdd) {
          addSongToGroup(targetGroupId, nameToAdd);
          if (!nameOverride) {
              setInputValue("");
          }
      }
  };

  const removeSong = (groupId: string, indexToRemove: number) => {
    updateGroup(groupId, g => ({
      ...g,
      items: g.items.filter((_, index) => index !== indexToRemove)
    }));
    triggerHaptic(); // 削除時に振動
  };

  const resetRows = () => {
    if (window.confirm("このセットリストを空にしますか？")) {
       const newId = `g-${Date.now()}`;
       const currentLives = LIVE_EVENTS.filter((e) => e.date === dateStr);
       const initialTitle = currentLives.length > 0 ? currentLives[0].liveName : "";
       const initialPlace = currentLives.length > 0 ? currentLives[0].place || "" : "";
       
       setGroups([{ id: newId, title: initialTitle, place: initialPlace, items: [] }]);
       setActiveGroupId(newId);
       setInputValue("");
       triggerHaptic();
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      // 同じグループ内の並べ替え
      const groupIndex = groups.findIndex(g => g.id === source.droppableId);
      if (groupIndex === -1) return;
      
      const group = groups[groupIndex];
      const newItems = Array.from(group.items);
      const [reorderedItem] = newItems.splice(source.index, 1);
      
      // 移動なしチェック
      if (source.index === destination.index) return;

      newItems.splice(destination.index, 0, reorderedItem);
      const newGroups = [...groups];
      newGroups[groupIndex] = { ...group, items: newItems };
      setGroups(newGroups);
      triggerHaptic(); // 並べ替え完了時に振動

    } else {
      // 別のグループへの移動
      const sourceGroupIndex = groups.findIndex(g => g.id === source.droppableId);
      const destGroupIndex = groups.findIndex(g => g.id === destination.droppableId);
      if (sourceGroupIndex === -1 || destGroupIndex === -1) return;
      
      const sourceGroup = groups[sourceGroupIndex];
      const destGroup = groups[destGroupIndex];
      const sourceItems = Array.from(sourceGroup.items);
      const destItems = Array.from(destGroup.items);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);
      
      const newGroups = [...groups];
      newGroups[sourceGroupIndex] = { ...sourceGroup, items: sourceItems };
      newGroups[destGroupIndex] = { ...destGroup, items: destItems };
      setGroups(newGroups);
      setActiveGroupId(destGroup.id);
      triggerHaptic(); // 移動完了時に振動
    }
  };

  const handleSwitchGroup = (id: string) => {
      setActiveGroupId(id);
      setInputValue(""); 
  };

  // --- Text Generation ---
  const tweetText = React.useMemo(() => {
    const [year, month, day] = dateStr.split("-");
    const formattedDate = `🗓️${parseInt(month)}/${parseInt(day)}`;
    let fullText = "";

    const formatItemName = (name: string) => {
        if (name === ENCORE_NAME) return `\n--- ${ENCORE_DISPLAY} ---\n`;
        return name;
    };

    if (groups.length === 1) {
        const g = groups[0];
        const placePart = g.place ? `📍${g.place}\n` : " ";
        fullText += `${formattedDate}${placePart}#キミそらセトリ\n\n`;
        if (g.title) fullText += `${g.title}\n\n`;
        let songCount = 0;
        const setlistText = g.items.map((item) => {
            const isSpecial = item.name === "SE" || item.name === "MC" || item.name === ENCORE_NAME;
            if (isSpecial) return formatItemName(item.name);
            else { songCount++; return `${songCount}. ${item.name}`; }
        }).join("\n");
        fullText += setlistText;
    } else {
        fullText += `${formattedDate} #キミそらセトリ\n\n`;
        groups.forEach((g) => {
            if (g.items.length === 0 && !g.title) return;
            if (g.title) fullText += `【${g.title}】\n`;
            if (g.place) fullText += `📍${g.place}\n`;
            let songCount = 0;
            const list = g.items.map((item) => {
                const isSpecial = item.name === "SE" || item.name === "MC" || item.name === ENCORE_NAME;
                if (isSpecial) return formatItemName(item.name);
                else { songCount++; return `${songCount}. ${item.name}`; }
            }).join("\n");
            fullText += list + "\n\n";
        });
    }
    fullText = fullText.trimEnd();
    fullText += `\n\n#キミそら #君と見るそら`;
    return fullText;
  }, [groups, dateStr]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
        setOpenSnackbar(true);
        triggerHaptic();
    });
  };

  const getSelectionInfo = (songTitle: string) => {
    if (!targetGroupId) return null;
    const activeGroup = groups.find(g => g.id === targetGroupId);
    if (!activeGroup) return null;

    const positions: number[] = [];
    activeGroup.items.forEach((item, index) => {
        if (item.name === songTitle) {
            positions.push(index + 1);
        }
    });

    if (positions.length === 0) return null;
    return positions.join(", ");
  };

  // --- Image Generation ---
  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    const element = document.getElementById("setlist-image-card");
    if (!element) { setIsGenerating(false); return; }
    try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: null, useCORS: true, logging: false });
        setPreviewUrl(canvas.toDataURL("image/png"));
        setOpenImageDialog(true);
        triggerHaptic();
    } catch (error) {
        console.error("Image generation failed", error);
        alert("画像の生成に失敗しました。");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveImage = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `kimisora_setlist_${dateStr}.png`;
    link.click();
    triggerHaptic();
  };

  const handleShareImage = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], `kimisora_setlist_${dateStr}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: tweetText });
      } else {
        alert("お使いの環境では画像のシェアに対応していません。\n画像を長押しして保存してください。");
      }
    } catch (error) { console.log("Share failed or canceled", error); }
  };

  const addGroup = (title: string = "", place: string = "") => {
      const newId = `g-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setGroups(prev => [...prev, { id: newId, title, place, items: [] }]);
      setActiveGroupId(newId);
      triggerHaptic();
  };
  
  const removeGroup = (groupId: string) => {
      if (groups.length <= 1) {
          if (window.confirm("セットリストを空にしますか？")) {
             setGroups([{ id: `g-${Date.now()}`, title: "", place: "", items: [] }]);
             setActiveGroupId(groups[0].id);
             triggerHaptic();
          }
          return;
      }
      if (window.confirm("このセットリストを削除しますか？")) {
          setGroups(prev => {
              const next = prev.filter(g => g.id !== groupId);
              if (activeGroupId === groupId && next.length > 0) setActiveGroupId(next[0].id);
              return next;
          });
          triggerHaptic();
      }
  };
  
  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, 300);
  };

  const remainingLives = todaysLives.filter(live => !groups.some(g => g.title === live.liveName));

  // --- Sort Logic for Dialog ---
  const sortedSongs = React.useMemo(() => {
      // 既存リスト
      const list = [...SONG_LIST];
      const activeGroup = groups.find(g => g.id === targetGroupId);
      if (activeGroup) {
          const addedNames = new Set(list.map(s => s.title));
          activeGroup.items.forEach((item) => {
             if (!addedNames.has(item.name)) {
                 // キーワードはとりあえずタイトルと同じにする
                 list.push({ title: item.name, keywords: item.name });
                 addedNames.add(item.name);
             }
          });
      }

      // ※以前の「選択した曲を末尾に移動する」ソート処理は削除しました
      // そのままの順序（SONG_LIST順 + 追加曲）で返します
      return list;
  }, [groups, targetGroupId]);

  // --- RENDER: START SCREEN ---
  if (!isInitialized) {
    return (
      <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: '#fafafa' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    キミそらセトリ
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    日付と公演を選択してスタート
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    日付を選択
                </Typography>
                <TextField
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputProps={{ sx: { fontSize: '1.2rem', fontWeight: 'bold' } }}
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    作成するセットリストを選択
                </Typography>
                <Stack spacing={2}>
                    {todaysLives.length > 0 ? (
                        <>
                            {todaysLives.map((live, idx) => (
                                <Button 
                                    key={idx}
                                    variant="contained" 
                                    size="large"
                                    color="primary"
                                    onClick={() => handleStart({
                                        id: `g-init-${idx}`,
                                        title: live.liveName,
                                        place: live.place || "",
                                        items: []
                                    })}
                                    sx={{ py: 1.5, fontWeight: 'bold' }}
                                >
                                    {live.liveName} で作成
                                </Button>
                            ))}
                            <Button 
                                variant="outlined" 
                                size="large"
                                color="inherit"
                                onClick={() => handleStart({
                                    id: `g-init-free`,
                                    title: "",
                                    place: "",
                                    items: []
                                })}
                            >
                                カスタムで作成
                            </Button>
                        </>
                    ) : (
                        <Button 
                            variant="contained" 
                            size="large"
                            color="primary"
                            onClick={() => handleStart({
                                id: `g-init-free`,
                                title: "",
                                place: "",
                                items: []
                            })}
                            startIcon={<AddIcon />}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                        >
                           新規セットリストを作成
                        </Button>
                    )}
                </Stack>
            </Box>
        </Paper>
      </Container>
    );
  }

  // --- RENDER: MAIN APP ---
  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ my: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          {dateStr.split('-')[1]}/{dateStr.split('-')[2]} のセトリ
        </Typography>
        <Button 
            size="small" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleResetToStart}
            color="inherit"
            sx={{ color: 'text.secondary' }}
        >
            日付選択に戻る
        </Button>
      </Box>

      {/* Setlist Editor */}
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1 }}>
          <Typography variant="h6">
             {groups.length > 1 ? "作成中のリスト" : "作成リスト"}
          </Typography>
          <Button color="error" size="small" onClick={resetRows}>全てリセット</Button>
        </Box>

        <DragDropContext onDragEnd={onDragEnd}>
          <Stack spacing={2}>
            {groups.map((group, groupIndex) => {
                const isActive = activeGroupId === group.id;
                return (
                    <Paper 
                        key={group.id}
                        id={`group-paper-${group.id}`} // Scroll target
                        elevation={isActive ? 4 : 1}
                        sx={{ 
                            p: 0, 
                            border: isActive ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isActive && groups.length > 1 && (
                            <Box sx={{ 
                                position: 'absolute', right: 0, top: 0, 
                                bgcolor: 'primary.main', color: 'white', 
                                px: 1, py: 0.5, 
                                borderBottomLeftRadius: 8, fontSize: '0.75rem', fontWeight: 'bold', zIndex: 1 
                            }}>
                                編集中
                            </Box>
                        )}

                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: isActive ? 'rgba(33, 150, 243, 0.05)' : '#fafafa', 
                                borderBottom: isActive ? '1px solid #eee' : 'none',
                                cursor: !isActive ? 'pointer' : 'default'
                            }}
                            onClick={() => !isActive && handleSwitchGroup(group.id)}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {groups.length > 1 && (
                                    <Box sx={{ 
                                            width: 24, height: 24, borderRadius: '50%', 
                                            bgcolor: isActive ? 'primary.main' : 'grey.400', 
                                            color: 'white', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
                                        }}
                                    >
                                        {groupIndex + 1}
                                    </Box>
                                )}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <TextField 
                                            variant="standard"
                                            placeholder="ライブ名 (例: 1部)"
                                            value={group.title}
                                            onChange={(e) => updateGroup(group.id, g => ({ ...g, title: e.target.value }))}
                                            fullWidth
                                            InputProps={{ 
                                                disableUnderline: !isActive,
                                                style: { fontWeight: 'bold', fontSize: '1.1rem', color: isActive ? 'inherit' : '#555' },
                                                endAdornment: (isActive && group.title) ? (
                                                    <InputAdornment position="end">
                                                        <IconButton size="small" onClick={() => updateGroup(group.id, g => ({ ...g, title: "" }))}>
                                                            <ClearIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ) : null
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {!isActive && <ExpandMoreIcon color="action" />}
                                        {isActive && groups.length > 1 && <ExpandLessIcon color="primary" />}
                                    </Stack>
                                    <TextField 
                                        variant="standard"
                                        placeholder="場所 (例: Zepp Shinjuku)"
                                        value={group.place}
                                        onChange={(e) => updateGroup(group.id, g => ({ ...g, place: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        sx={{ mt: 0.5, display: (isActive || group.place) ? 'block' : 'none' }}
                                        InputProps={{ 
                                            disableUnderline: !isActive,
                                            startAdornment: <InputAdornment position="start">📍</InputAdornment>,
                                            style: { fontSize: '0.9rem', color: '#666' },
                                            endAdornment: (isActive && group.place) ? (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => updateGroup(group.id, g => ({ ...g, place: "" }))}>
                                                        <ClearIcon fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </Box>
                                {groups.length > 1 && isActive && (
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeGroup(group.id); }}>
                                        <CloseIcon />
                                    </IconButton>
                                )}
                            </Stack>
                        </Box>

                        <Collapse in={isActive} timeout="auto" unmountOnExit={false}>
                            <Box sx={{ p: 2 }}>
                                {/* Droppable Area */}
                                <Droppable droppableId={group.id}>
                                {(provided) => (
                                    <Table size="small" ref={provided.innerRef} {...provided.droppableProps} sx={{ mb: 2 }}>
                                    <TableBody>
                                        {group.items.length === 0 && (
                                        <TableRow>
                                            <TableCell align="center" sx={{ py: 3, color: "text.secondary", borderBottom: 'none' }}>
                                            曲がありません。<br/>下のボタンから曲を追加してください。
                                            </TableCell>
                                        </TableRow>
                                        )}
                                        {group.items.map((item, index) => {
                                            const isEncore = item.name === ENCORE_NAME;
                                            return (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                    {(provided, snapshot) => (
                                                    <TableRow
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        sx={{ 
                                                            backgroundColor: snapshot.isDragging ? "#f5f5f5" : "inherit", 
                                                            display: snapshot.isDragging ? "table" : undefined,
                                                        }}
                                                    >
                                                        <TableCell width="40px" align="center" {...provided.dragHandleProps} sx={{ color: "text.secondary", cursor: "grab" }}>
                                                            <DragHandleIcon fontSize="small" />
                                                        </TableCell>
                                                        <TableCell>
                                                            {isEncore ? (
                                                                <Divider sx={{ my: 1 }}>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                                        {ENCORE_DISPLAY}
                                                                    </Typography>
                                                                </Divider>
                                                            ) : (
                                                                <Typography variant="body1">{item.name}</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right" width="50px">
                                                            <IconButton size="small" onClick={() => removeSong(group.id, index)}>
                                                                <DeleteIcon fontSize="small" color="action" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </TableBody>
                                    </Table>
                                )}
                                </Droppable>

                                {/* Song Input Area (Changed to Dialog Button) */}
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    startIcon={<AddIcon />} 
                                    onClick={(e) => { e.stopPropagation(); handleOpenAddSongDialog(group.id); }}
                                    sx={{ mt: 1, borderStyle: 'dashed', py: 1.5, borderRadius: 2, bgcolor: 'white' }}
                                >
                                    曲を追加
                                </Button>
                            </Box>
                        </Collapse>
                    </Paper>
                );
            })}
            
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {remainingLives.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {remainingLives.map((live, idx) => (
                            <Button
                                key={idx}
                                variant="outlined"
                                color="warning"
                                onClick={() => addGroup(live.liveName, live.place || "")}
                                startIcon={<AddIcon />}
                                fullWidth
                            >
                                「{live.liveName}」を追加
                            </Button>
                        ))}
                    </Box>
                )}
                <Button 
                    variant="outlined" 
                    sx={{ border: '2px dashed #ccc', color: '#888', py: 1.5 }} 
                    onClick={() => addGroup("", "")}
                    startIcon={<AddIcon />}
                    fullWidth
                >
                    新しいセットリストを追加
                </Button>
            </Box>
          </Stack>
        </DragDropContext>
      </Box>

      {/* Action Area */}
      <Paper sx={{ p: 2, mt: 4, bgcolor: "#f8f9fa" }} elevation={0}>
        <TextField
          label="ツイート内容プレビュー"
          value={tweetText}
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          sx={{ mb: 2, bgcolor: "white" }}
          InputProps={{ readOnly: true }}
        />
        <Stack direction={isMobile ? "column" : "row"} spacing={2} justifyContent="center">
           <Button
            variant="outlined"
            color="secondary"
            startIcon={isGenerating ? <CircularProgress size={20} /> : <ImageIcon />}
            onClick={handleGeneratePreview}
            fullWidth
            size="large"
            disabled={groups.every(g => g.items.length === 0) || isGenerating}
          >
            {isGenerating ? "生成中..." : "画像生成"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TwitterIcon />}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
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

      {/* Song Add Dialog */}
      <Dialog 
        open={isAddSongDialogOpen} 
        onClose={() => setIsAddSongDialogOpen(false)} 
        fullWidth 
        maxWidth="xs"
        // スマホ対策: キーボードが出ても隠れないように上部に固定配置
        PaperProps={{
            sx: {
                position: 'fixed',
                top: 50,
                m: 2,
                maxHeight: 'calc(100% - 100px)',
                bgcolor: '#fafafa'
            }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>曲を追加</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                曲ボタンをタップして追加
            </Typography>

            {/* Manual Input Area (Top) */}
            <Box ref={inputRef} sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="リストにない曲はここから" 
                    variant="outlined" 
                    size="small"
                    fullWidth
                    // Auto focus removed for better mobile UX
                    // Scroll to view on focus
                    onFocus={handleInputFocus}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                        ),
                        sx: { bgcolor: 'white' }
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSongAddition();
                        }
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={() => handleSongAddition()}
                    disabled={!inputValue.trim()}
                    sx={{ minWidth: '70px', fontWeight: 'bold' }}
                >
                    追加
                </Button>
            </Box>

            {/* Song List Buttons (Grid Only - SE/MC/Encore included) */}
            <Grid container spacing={1}>
                {sortedSongs.map((song) => {
                    const selectionInfo = getSelectionInfo(song.title);
                    return (
                        <Grid item xs={4} sm={4} key={song.title}>
                            <Badge 
                                badgeContent={selectionInfo} 
                                color="secondary" 
                                invisible={!selectionInfo}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                sx={{ 
                                    width: '100%', 
                                    height: '100%',
                                    '& .MuiBadge-badge': { 
                                        right: 8, 
                                        top: 8, 
                                        fontWeight: 'bold', 
                                        boxShadow: '0 0 0 2px #fff',
                                        fontSize: '0.8rem'
                                    } 
                                }}
                            >
                                <Button 
                                    variant={selectionInfo ? "contained" : "outlined"}
                                    onClick={() => handleSongAddition(song.title)} 
                                    fullWidth 
                                    size="small"
                                    sx={{ 
                                        height: '100%',
                                        minHeight: '48px',
                                        borderRadius: 2,
                                        borderWidth: selectionInfo ? 0 : 1,
                                        borderColor: selectionInfo ? 'transparent' : 'grey.300',
                                        bgcolor: selectionInfo ? 'primary.main' : 'white',
                                        color: selectionInfo ? 'white' : 'text.primary',
                                        boxShadow: selectionInfo ? 3 : 0,
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        lineHeight: 1.2,
                                        p: 1,
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            bgcolor: selectionInfo ? 'primary.dark' : 'grey.100',
                                            borderColor: 'grey.400',
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(1px)',
                                            boxShadow: 1
                                        }
                                    }}
                                >
                                    {song.title}
                                </Button>
                            </Badge>
                        </Grid>
                    )
                })}
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setIsAddSongDialogOpen(false)} color="inherit" sx={{ width: '100%', py: 1.5 }}>閉じる（完了）</Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Image Generator */}
      <Box sx={{ position: "fixed", top: 0, left: "-2000px", zIndex: -1 }}>
        <Paper
            id="setlist-image-card"
            elevation={0}
            sx={{
                width: "600px", 
                minHeight: "600px",
                p: 5,
                borderRadius: 4,
                background: "linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)",
                position: "relative",
                overflow: "hidden",
                boxSizing: 'border-box'
            }}
            >
            <Box sx={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.4)" }} />
            <Box sx={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.4)" }} />
            <Box sx={{ position: "relative", zIndex: 1, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: "#0277bd", fontWeight: "bold", mb: 0.5, letterSpacing: 2 }}>
                {dateStr.replace(/-/g, '.')}
                </Typography>
                <Box sx={{ mb: 3 }}>
                    {(groups.length === 1 && groups[0].title) && (
                         <Typography variant="h4" sx={{ fontWeight: "900", color: "#424242", lineHeight: 1.3 }}>
                            {groups[0].title}
                         </Typography>
                    )}
                    {(groups.length === 1 && groups[0].place) && (
                        <Typography variant="h6" sx={{ color: "#757575", mt: 1, fontWeight: 'normal' }}>
                            @ {groups[0].place}
                        </Typography>
                    )}
                </Box>
                {groups.length === 1 && (
                     <Box sx={{ width: '60%', height: '3px', bgcolor: 'primary.main', mx: 'auto', mb: 4, opacity: 0.6, borderRadius: 2 }} />
                )}
                <Stack spacing={4} sx={{ textAlign: 'left', mx: 4 }}>
                    {groups.map((group, gIdx) => {
                        if (group.items.length === 0 && !group.title) return null;
                        return (
                            <Box key={group.id}>
                                {groups.length > 1 && (
                                    <Box sx={{ mb: 2, textAlign: 'center', borderBottom: '2px dashed #90caf9', pb: 1 }}>
                                        {group.title && <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1565c0" }}>{group.title}</Typography>}
                                        {group.place && <Typography variant="body2" sx={{ color: "#666" }}>@ {group.place}</Typography>}
                                    </Box>
                                )}
                                <Stack spacing={1.5}>
                                    {group.items.map((item, index) => {
                                        const isEncore = item.name === ENCORE_NAME;
                                        if (isEncore) {
                                            return (
                                                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                                                    <Box sx={{ height: '2px', bgcolor: 'text.secondary', width: '40px', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '1.2rem', letterSpacing: 2 }}>
                                                        {ENCORE_DISPLAY}
                                                    </Typography>
                                                    <Box sx={{ height: '2px', bgcolor: 'text.secondary', width: '40px', ml: 2 }} />
                                                </Box>
                                            )
                                        }

                                        const isSpecial = item.name === "MC" || item.name === "SE";
                                        let count = 0;
                                        for(let i=0; i<index; i++) { 
                                            const name = group.items[i].name;
                                            if(name !== "MC" && name !== "SE" && name !== ENCORE_NAME) count++; 
                                        }
                                        const displayNum = isSpecial ? "" : `${String(count + 1).padStart(2, '0')}.`;
                                        return (
                                            <Box key={item.id} sx={{ display: 'flex', alignItems: 'baseline' }}>
                                                <Typography sx={{ width: '40px', fontWeight: '900', color: 'primary.main', fontSize: isSpecial ? '1rem' : '1.4rem', mr: 1, textAlign: 'right', fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
                                                {displayNum}
                                                </Typography>
                                                <Typography sx={{ fontWeight: isSpecial ? 'normal' : 'bold', color: isSpecial ? 'text.secondary' : 'text.primary', fontSize: isSpecial ? '1.1rem' : '1.5rem', lineHeight: 1.2 }}>
                                                {item.name}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
                <Box sx={{ mt: 5, pt: 2, borderTop: '2px dashed #bdbdbd' }}>
                <Typography variant="body1" sx={{ color: "#757575", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontWeight: 'bold' }}>
                    #キミそらセトリ
                </Typography>
                </Box>
            </Box>
        </Paper>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md" fullWidth scroll="body">
        <DialogTitle>{canShare && isMobile ? "画像をシェア！" : "画像を保存してシェア！"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f5f5f5', p: isMobile ? 2 : 4 }}>
            <Typography variant="caption" sx={{ mb: 2, textAlign: 'center' }}>
                {isMobile ? "画像を長押しして保存することもできます" : "※保存ボタンが効かない場合は画像を長押しして保存してください"}
            </Typography>
            {previewUrl ? (
                <img src={previewUrl} alt="Setlist Preview" style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '8px' }} />
            ) : <CircularProgress />}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Stack direction="column" spacing={2} width="100%">
            {isMobile && canShare && (
              <Button variant="contained" color="info" onClick={handleShareImage} startIcon={<ShareIcon />} size="large" fullWidth sx={{ borderRadius: 10, fontWeight: 'bold', py: 1.5 }}>
                画像をシェア (Xなど)
              </Button>
            )}
            {!isMobile && (
              <Button variant="contained" onClick={handleSaveImage} startIcon={<DownloadIcon />} size="large" fullWidth sx={{ borderRadius: 10, fontWeight: 'bold', py: 1.5 }}>
                  画像を保存
              </Button>
            )}
            <Button onClick={() => setOpenImageDialog(false)} fullWidth sx={{ color: 'text.secondary' }}>閉じる</Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Container>
  );
}