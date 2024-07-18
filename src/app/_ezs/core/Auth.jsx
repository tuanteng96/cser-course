import { useState, useEffect, createContext, useContext } from "react";
import { LayoutSplashScreen } from "./EzsSplashScreen";

const AuthContext = createContext();

const useAuth = () => {
  return useContext(AuthContext);
};

if (import.meta.env.DEV) {
  window.top.Info = {
    User: {
      ID: 1,
      FullName: 'Admin System'
    },
    Stocks: [
      {
        Title: 'Quản lý cơ sở',
        ID: 778,
        ParentID: 0
      },
      {
        Title: 'Cser Hà Nội',
        ID: 11375,
        ParentID: 778
      },
      {
        Title: 'Cser Hồ Chí Minh',
        ID: 11376,
        ParentID: 778
      },
      {
        Title: 'Cser Đà Nẵng',
        ID: 11377,
        ParentID: 778
      },
      {
        Title: 'cser Bà nà',
        ID: 11381,
        ParentID: 778
      },
      {
        Title: "Cơ sở A",
        ID: 11382,
        ParentID: 778
      },
      {
        Title:  "Cơ sở B",
        ID: 11383,
        ParentID: 778
      }
    ],
    rightTree: {
      groups: [
        {
          group: 'Phần mềm',
          rights: [
            {
              IsAllStock: true,
              hasRight: true,
              name: 'course',
              subs: [
                {
                  IsAllStock: false,
                  hasRight: true,
                  name: 'course_co_ban',
                  stocks: '',
                  stocksList: [
                    {
                      Title: "Cser Hà Nội",
                      ID: 11375,
                      ParentID: 778
                    }
                  ]
                },
                {
                  IsAllStock: false,
                  hasRight: true,
                  name: 'course_nang_cao',
                  stocks: '',
                  stocksList: [
                    {
                      Title: "Cser Hà Nội",
                      ID: 11375,
                      ParentID: 778
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    CrStockID: 11375,
    token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjQ2IiwibmJmIjoxNzIxMDIxNDkzLCJleHAiOjE4MDc0MjE0OTMsImlhdCI6MTcyMTAyMTQ5M30.Gm47FLycgozwpMnEGn_Eld4uakgrz_kmLvosYc4aYJ8'
  }
}

const getInfoLocalStorage = () => {
  return new Promise(function (resolve) {
    function getInfo() {
      if (window.top.Info) {
        resolve({
          Auth: window.top.Info,
        });
      } else {
        setTimeout(() => {
          getInfo();
        }, 50);
      }
    }
    getInfo();
  });
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [CrStocks, setCrStocks] = useState(null);
  const [Stocks, setStocks] = useState(null);
  const [RightTree, setRightTree] = useState(null);

  const saveAuth = ({ CrStockID, token, User, rightTree, ...values }) => {
    let newStocks = values.Stocks
      ? values.Stocks.filter((x) => x.ParentID !== 0).map((x) => ({
          ...x,
          label: x.Title,
          value: x.ID,
        }))
      : [];
    let index = newStocks.findIndex((x) => x.ID === CrStockID);
    setAuth(User);
    setAccessToken(token);
    setStocks(newStocks);
    setRightTree(rightTree);

    if (index > -1) {
      setCrStocks(newStocks[index]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        accessToken,
        CrStocks,
        Stocks,
        RightTree,
        saveAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const AuthInit = ({ children }) => {
  const { saveAuth } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    getInfoLocalStorage().then(({ Auth }) => {
      setShowSplashScreen(false);
      saveAuth(Auth);
    });
    // eslint-disable-next-line
  }, []);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };
