import { Route, Routes } from "react-router-dom";
import Base from "./containers/base/base";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" Component={Base} />
    </Routes>
  );
};
export default AppRouter;
