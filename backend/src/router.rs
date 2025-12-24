use qubit::server::Router as QubitRouter;
use crate::{get_name_history, search_names, AppState};

/// Creates a Qubit router with all the handlers configured.
pub fn create_router() -> QubitRouter<AppState> {
    QubitRouter::new()
        .handler(get_name_history)
        .handler(search_names)
}

