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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

const music = [
  "SE",
  "MC",
  "あたしイズム宣言‼︎!",
  "ソライロ",
  "ド・ド・ド・ド・ドーナッツ",
  "ふわり、初恋。",
  "君とあの日の距離",
  "月から金まで",
  "等身大のアイラブミー",
  "遠回りがいいっ!",
  "特別な時間",
  "好きって。",
  "青春らいおっと",
  "青春はサイダー!",
  "待っていてね。",
  "指先の向こう",
  "BRAND NEW ME!",
  "新曲"
];

type Music = {
  name: string;
  index: number;
  order: number;
};

export default function App() {
  const [rows, setRows] = React.useState<Music[]>([]);
  const [setri, setSetri] = React.useState("");

  const onClickMusic = (text: string) => {
    const index = rows.length;
    const newRecord = {
      name: text,
      index: index,
      order: index,
    };
    const newRows = [...rows, newRecord];
    setRows(newRows);
    setNewSetri(newRows);
  };

  const resetRows = () => {
    setRows([]);
    setSetri("");
  };
  const reorder = (startIndex: number, endIndex: number) => {
    const result = Array.from(rows);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    result.map((row, index) => (row.order = index));
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const update = reorder(source.index, destination.index);
    setRows(update);
    setNewSetri(update);
  };

  const setNewSetri = (rows: Music[]) => {
    const date = new Date();
    const month = date.getMonth() + 1;
    let order = 0;
    setSetri(
      `${month}/${date.getDate()} #キミそらセトリ\n\n` +
        rows
          .map((row, index) => {
            if (row.name == "MC") {
              return "MC";
            } else if (row.name == "SE") {
              return "SE";
            } else {
              order++;
              return `${order}. ${row.name}`;
            }
          })
          .join("\n") +
        "\n\n#キミそら #君と見るそら"
    );
  };

  const selectAllText = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    e.target.select();
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        {music.map((m) => (
          <Button
            variant="contained"
            sx={{ m: 1 }}
            onClick={() => onClickMusic(m)}
          >
            <AddIcon />
            {m}
          </Button>
        ))}
      </Box>

      <Box sx={{ my: 4 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  長押しで並び替え
                  <Button
                    variant="outlined"
                    sx={{ m: 1 }}
                    onClick={() => resetRows()}
                  >
                    リセット
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={"dndTableBody"}>
                {(provided) => (
                  <TableBody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {rows.map((row, index) => (
                      <Draggable
                        draggableId={row.name}
                        index={index}
                        key={row.name}
                      >
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TableCell>{row.name}</TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </DragDropContext>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ my: 4 }}>
        <Button
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            setri
          )}`}
          variant="contained"
          sx={{ m: 1 }}
        >
          ツイートする
        </Button>
      </Box>

      <Box sx={{ my: 4 }}>
        <TextField
          id="outlined-textarea"
          label="コピー用"
          value={setri}
          onFocus={selectAllText}
          multiline
        />
      </Box>
    </Container>
  );
}
