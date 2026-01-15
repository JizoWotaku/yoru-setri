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
  Autocomplete,
  FilterOptionsState,
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

type SetlistItem = {
  id: string;
  name: string;
};

// Group definition for multiple setlists
type SetlistGroup = {
  id: string;
  title: string;
  place: string;
  items: SetlistItem[];
};

// Input options type
type SongOption = {
  title: string;
  type: 'song' | 'se' | 'mc';
  keywords?: string[] | string;
};

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --- App Flow State ---
  // false: Show Start Screen, true: Show Editor
  const [isInitialized, setIsInitialized] = React.useState(false);

  // --- Data State ---
  const [dateStr, setDateStr] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const [groups, setGroups] = React.useState<SetlistGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = React.useState<string>("");

  // --- Input State ---
  const [inputValue, setInputValue] = React.useState("");
  const [selectedOption, setSelectedOption] = React.useState<SongOption | null>(null);

  // --- UI State ---
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [openImageDialog, setOpenImageDialog] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    if (typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  // Prepare Autocomplete Options (Songs + SE + MC)
  const autocompleteOptions = React.useMemo(() => {
    const songs: SongOption[] = SONG_LIST.map(s => ({ 
        title: s.title, 
        type: 'song',
        keywords: s.keywords 
    }));
    return songs;
  }, []);

  // Custom Filter Logic for Fuzzy/Keyword Search
  const filterOptions = (options: SongOption[], state: FilterOptionsState<SongOption>) => {
    const input = state.inputValue.toLowerCase();
    return options.filter((option) => {
        // 1. Title match
        const titleMatch = option.title.toLowerCase().indexOf(input) !== -1;
        
        // 2. Keyword match
        let keywordMatch = false;
        if (option.keywords) {
            if (Array.isArray(option.keywords)) {
                keywordMatch = option.keywords.some(k => k.toLowerCase().indexOf(input) !== -1);
            } else if (typeof option.keywords === 'string') {
                keywordMatch = option.keywords.toLowerCase().indexOf(input) !== -1;
            }
        }
        
        return titleMatch || keywordMatch;
    });
  };

  // --- Handlers: Start Screen ---

  const todaysLives = React.useMemo(() => {
    return LIVE_EVENTS.filter((e) => e.date === dateStr);
  }, [dateStr]);

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
    }
  };

  // --- Handlers: Editor ---

  const updateGroup = (groupId: string, updater: (g: SetlistGroup) => SetlistGroup) => {
    setGroups(prev => prev.map(g => g.id === groupId ? updater(g) : g));
  };

  // Add song from Autocomplete
  const addSong = () => {
    const nameToAdd = selectedOption ? selectedOption.title : inputValue;

    if (!nameToAdd.trim()) return;

    const newItem: SetlistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nameToAdd,
    };
    
    // Add to ACTIVE group
    let targetId = activeGroupId;
    if (!groups.find(g => g.id === targetId)) {
       if (groups.length > 0) {
           targetId = groups[groups.length - 1].id;
           setActiveGroupId(targetId);
       } else {
           return; 
       }
    }

    updateGroup(targetId, g => ({
      ...g,
      items: [...g.items, newItem]
    }));

    // Reset input
    setInputValue("");
    setSelectedOption(null);
  };

  const removeSong = (groupId: string, indexToRemove: number) => {
    updateGroup(groupId, g => ({
      ...g,
      items: g.items.filter((_, index) => index !== indexToRemove)
    }));
  };

  const resetRows = () => {
    if (window.confirm("このセットリストを空にしますか？\n（日付選択画面には戻りません）")) {
       const newId = `g-${Date.now()}`;
       // リセット時は現在の日付のライブ情報を再利用
       const currentLives = LIVE_EVENTS.filter((e) => e.date === dateStr);
       const initialTitle = currentLives.length > 0 ? currentLives[0].liveName : "";
       const initialPlace = currentLives.length > 0 ? currentLives[0].place || "" : "";
       
       setGroups([{ id: newId, title: initialTitle, place: initialPlace, items: [] }]);
       setActiveGroupId(newId);
       setInputValue("");
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const groupIndex = groups.findIndex(g => g.id === source.droppableId);
      if (groupIndex === -1) return;
      const group = groups[groupIndex];
      const newItems = Array.from(group.items);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);
      const newGroups = [...groups];
      newGroups[groupIndex] = { ...group, items: newItems };
      setGroups(newGroups);
    } else {
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
    }
  };

  // Switch Active Group Helper
  const handleSwitchGroup = (id: string) => {
      setActiveGroupId(id);
      setInputValue(""); // Clear input when switching context
      setSelectedOption(null);
  };

  // --- Text Generation ---
  const tweetText = React.useMemo(() => {
    const [year, month, day] = dateStr.split("-");
    const formattedDate = `🗓️${parseInt(month)}/${parseInt(day)}`;
    let fullText = "";

    if (groups.length === 1) {
        const g = groups[0];
        const placePart = g.place ? `📍${g.place}\n` : " ";
        fullText += `${formattedDate}${placePart}#キミそらセトリ\n\n`;
        if (g.title) fullText += `${g.title}\n\n`;
        let songCount = 0;
        const setlistText = g.items.map((item) => {
            if (item.name === "SE" || item.name === "MC") return item.name;
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
                if (item.name === "SE" || item.name === "MC") return item.name;
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
    navigator.clipboard.writeText(tweetText).then(() => setOpenSnackbar(true));
  };

  // バッジ情報取得（現在のアクティブグループに対して）
  const getSelectionInfo = (songTitle: string) => {
    const activeGroup = groups.find(g => g.id === activeGroupId);
    if (!activeGroup) return null;
    if (songTitle === "SE" || songTitle === "MC") {
        return activeGroup.items.some(item => item.name === songTitle) ? "✔" : null;
    }
    let songCount = 0;
    const positions: number[] = [];
    activeGroup.items.forEach((item) => {
        if (item.name !== "SE" && item.name !== "MC") {
            songCount++;
            if (item.name === songTitle) positions.push(songCount);
        }
    });
    if (positions.length === 0) return null;
    return positions.join(",");
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
  };
  
  const removeGroup = (groupId: string) => {
      if (groups.length <= 1) {
          if (window.confirm("セットリストを空にしますか？")) {
             setGroups([{ id: `g-${Date.now()}`, title: "", place: "", items: [] }]);
             setActiveGroupId(groups[0].id);
          }
          return;
      }
      if (window.confirm("このセットリストを削除しますか？")) {
          setGroups(prev => {
              const next = prev.filter(g => g.id !== groupId);
              if (activeGroupId === groupId && next.length > 0) setActiveGroupId(next[0].id);
              return next;
          });
      }
  };

  const remainingLives = todaysLives.filter(live => !groups.some(g => g.title === live.liveName));

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
                                自由入力で作成
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
                                            曲がありません。<br/>下のフォームから曲を追加してください。
                                            </TableCell>
                                        </TableRow>
                                        )}
                                        {group.items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided, snapshot) => (
                                            <TableRow
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                sx={{ backgroundColor: snapshot.isDragging ? "#f5f5f5" : "inherit", display: snapshot.isDragging ? "table" : undefined }}
                                            >
                                                <TableCell width="40px" align="center" {...provided.dragHandleProps} sx={{ color: "text.secondary", cursor: "grab" }}>
                                                    <DragHandleIcon fontSize="small" />
                                                </TableCell>
                                                <TableCell><Typography variant="body1">{item.name}</Typography></TableCell>
                                                <TableCell align="right" width="50px">
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeSong(group.id, index); }}>
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

                                {/* Song Input Area (Moved Inside Group) */}
                                <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
                                    <Autocomplete
                                        freeSolo
                                        fullWidth
                                        options={autocompleteOptions}
                                        getOptionLabel={(option) => {
                                            if (typeof option === 'string') return option;
                                            return option.title;
                                        }}
                                        filterOptions={filterOptions}
                                        value={selectedOption}
                                        inputValue={inputValue}
                                        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                                        onChange={(_, newValue) => {
                                            if (typeof newValue === 'string') {
                                                setSelectedOption({ title: newValue, type: 'song' });
                                            } else {
                                                setSelectedOption(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                placeholder="曲名 / SE / MC" 
                                                variant="outlined" 
                                                size="small"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon color="action" fontSize="small"/>
                                                        </InputAdornment>
                                                    )
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSong();
                                                    }
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                           <li {...props}>
                                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                   <Typography variant="body2">{option.title}</Typography>
                                                   {getSelectionInfo(option.title) && (
                                                       <Typography variant="caption" color="primary" fontWeight="bold">
                                                           {getSelectionInfo(option.title)}
                                                       </Typography>
                                                   )}
                                               </Box>
                                           </li>
                                        )}
                                    />
                                    <Button 
                                        variant="contained" 
                                        onClick={addSong}
                                        disabled={!inputValue.trim()}
                                        sx={{ minWidth: '70px', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                                    >
                                        追加
                                    </Button>
                                </Box>
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
                    自由入力でセットリストを追加
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
                                        const isSpecial = item.name === "MC" || item.name === "SE";
                                        let count = 0;
                                        for(let i=0; i<index; i++) { if(group.items[i].name !== "MC" && group.items[i].name !== "SE") count++; }
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