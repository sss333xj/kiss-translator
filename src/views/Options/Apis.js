import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  OPT_TRANS_ALL,
  OPT_TRANS_MICROSOFT,
  OPT_TRANS_DEEPL,
  OPT_TRANS_DEEPLFREE,
  OPT_TRANS_BAIDU,
  OPT_TRANS_TENCENT,
  OPT_TRANS_OPENAI,
  OPT_TRANS_GEMINI,
  OPT_TRANS_CLOUDFLAREAI,
  OPT_TRANS_CUSTOMIZE,
  OPT_TRANS_NIUTRANS,
  URL_KISS_PROXY,
  URL_NIUTRANS_REG,
  DEFAULT_FETCH_LIMIT,
  DEFAULT_FETCH_INTERVAL,
} from "../../config";
import { useState } from "react";
import { useI18n } from "../../hooks/I18n";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Alert from "@mui/material/Alert";
import { useAlert } from "../../hooks/Alert";
import { useApi } from "../../hooks/Api";
import { apiTranslate } from "../../apis";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { limitNumber } from "../../libs/utils";

function TestButton({ translator, api }) {
  const i18n = useI18n();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const handleApiTest = async () => {
    try {
      setLoading(true);
      const [text] = await apiTranslate({
        translator,
        text: "hello world",
        fromLang: "en",
        toLang: "zh-CN",
        apiSetting: api,
        useCache: false,
      });
      if (!text) {
        throw new Error("empty reault");
      }
      alert.success(i18n("test_success"));
    } catch (err) {
      // alert.error(`${i18n("test_failed")}: ${err.message}`);
      let msg = err.message;
      try {
        msg = JSON.stringify(JSON.parse(err.message), null, 2);
      } catch (err) {
        // skip
      }
      alert.error(
        <>
          <div>{i18n("test_failed")}</div>
          {msg === err.message ? (
            <div
              style={{
                maxWidth: 400,
              }}
            >
              {msg}
            </div>
          ) : (
            <pre
              style={{
                maxWidth: 400,
                overflow: "auto",
              }}
            >
              {msg}
            </pre>
          )}
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress size={16} />;
  }

  return (
    <Button size="small" variant="contained" onClick={handleApiTest}>
      {i18n("click_test")}
    </Button>
  );
}

function ApiFields({ translator }) {
  const i18n = useI18n();
  const { api, updateApi, resetApi } = useApi(translator);
  const {
    url = "",
    key = "",
    model = "",
    prompt = "",
    fetchLimit = DEFAULT_FETCH_LIMIT,
    fetchInterval = DEFAULT_FETCH_INTERVAL,
    dictNo = "",
    memoryNo = "",
  } = api;

  const handleChange = (e) => {
    let { name, value } = e.target;
    switch (name) {
      case "fetchLimit":
        value = limitNumber(value, 1, 100);
        break;
      case "fetchInterval":
        value = limitNumber(value, 0, 5000);
        break;
      default:
    }
    updateApi({
      [name]: value,
    });
  };

  const buildinTranslators = [
    OPT_TRANS_MICROSOFT,
    OPT_TRANS_DEEPLFREE,
    OPT_TRANS_BAIDU,
    OPT_TRANS_TENCENT,
  ];

  const mulkeysTranslators = [
    OPT_TRANS_DEEPL,
    OPT_TRANS_OPENAI,
    OPT_TRANS_GEMINI,
    OPT_TRANS_CLOUDFLAREAI,
    OPT_TRANS_NIUTRANS,
  ];

  const keyHelper =
    translator === OPT_TRANS_NIUTRANS ? (
      <>
        {i18n("mulkeys_help")}
        <Link href={URL_NIUTRANS_REG} target="_blank">
          {i18n("reg_niutrans")}
        </Link>
      </>
    ) : mulkeysTranslators.includes(translator) ? (
      i18n("mulkeys_help")
    ) : (
      ""
    );

  return (
    <Stack spacing={3}>
      {!buildinTranslators.includes(translator) && (
        <>
          <TextField
            size="small"
            label={"URL"}
            name="url"
            value={url}
            onChange={handleChange}
          />
          <TextField
            size="small"
            label={"KEY"}
            name="key"
            value={key}
            onChange={handleChange}
            multiline={mulkeysTranslators.includes(translator)}
            helperText={keyHelper}
          />
        </>
      )}

      {(translator === OPT_TRANS_OPENAI || translator === OPT_TRANS_GEMINI) && (
        <>
          <TextField
            size="small"
            label={"MODEL"}
            name="model"
            value={model}
            onChange={handleChange}
          />
          <TextField
            size="small"
            label={"PROMPT"}
            name="prompt"
            value={prompt}
            onChange={handleChange}
            multiline
          />
        </>
      )}

      {translator === OPT_TRANS_NIUTRANS && (
        <>
          <TextField
            size="small"
            label={"DictNo"}
            name="dictNo"
            value={dictNo}
            onChange={handleChange}
          />
          <TextField
            size="small"
            label={"MemoryNo"}
            name="memoryNo"
            value={memoryNo}
            onChange={handleChange}
          />
        </>
      )}

      <TextField
        size="small"
        label={i18n("fetch_limit")}
        type="number"
        name="fetchLimit"
        value={fetchLimit}
        onChange={handleChange}
      />

      <TextField
        size="small"
        label={i18n("fetch_interval")}
        type="number"
        name="fetchInterval"
        value={fetchInterval}
        onChange={handleChange}
      />

      <Stack direction="row" spacing={2}>
        <TestButton translator={translator} api={api} />
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            resetApi();
          }}
        >
          {i18n("restore_default")}
        </Button>
      </Stack>

      {translator.startsWith(OPT_TRANS_CUSTOMIZE) && (
        <pre>{i18n("custom_api_help")}</pre>
      )}
    </Stack>
  );
}

function ApiAccordion({ translator }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e) => {
    setExpanded((pre) => !pre);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{translator}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {expanded && <ApiFields translator={translator} />}
      </AccordionDetails>
    </Accordion>
  );
}

export default function Apis() {
  const i18n = useI18n();
  return (
    <Box>
      <Stack spacing={3}>
        <Alert severity="info">
          <Link href={URL_KISS_PROXY} target="_blank">
            {i18n("about_api_proxy")}
          </Link>
        </Alert>

        <Box>
          {OPT_TRANS_ALL.map((translator) => (
            <ApiAccordion key={translator} translator={translator} />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
