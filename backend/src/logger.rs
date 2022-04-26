use wasm_bindgen::prelude::*;
use serde::Serialize;

#[derive(Serialize)]
pub struct Log {
    text: String,
    level: String,
    location: String,
}

impl Log {
    pub fn new (record: &log::Record) -> Self {
        Self {
            text: format!("{}", record.args()),
            level: match record.level() {
                log::Level::Error   =>  format!("error"),
                log::Level::Warn    =>  format!("warning"),
                log::Level::Info    =>  format!("info"),
                log::Level::Debug   =>  format!("debug"),
                log::Level::Trace   =>  format!("trace"),
            },
            location: match (record.file(), record.line()) {
                (Some(file), Some(line))    =>  format!("{}:{}", file, line),
                _                           =>  format!("unknown"),
            },
        }
    }
}

pub struct Logger {
    callback: js_sys::Function,
}

impl Logger {
    pub fn new (callback: js_sys::Function) -> Self {
        Self {
            callback,
        }
    }
}

impl log::Log for Logger {
    fn enabled (&self, _metadata: &log::Metadata) -> bool {
        true
    }

    fn log (&self, record: &log::Record) {
        self.callback.call1(&JsValue::null(), &JsValue::from_serde(&Log::new(record)).unwrap()).unwrap();
    }

    fn flush (&self) {}
}

unsafe impl Sync for Logger {}
unsafe impl Send for Logger {}
