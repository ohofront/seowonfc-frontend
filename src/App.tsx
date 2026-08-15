import {Route,Routes} from 'react-router-dom';
import {Layout} from './components/Layout';
import {NotFound} from './components/UI';
import {ProtectedRoute} from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import {LoginPage,SignupPage} from './pages/AuthPages';
import {NewsDetailPage,NewsListPage} from './pages/NewsPages';
import {MyPlayerApplicationsPage,PlayerApplicationPage,PlayerDetailPage,PlayersPage} from './pages/PlayerPages';
import {MatchesPage,StandingsPage} from './pages/MatchPages';
import {BoardListPage,PostDetailPage,PostWritePage} from './pages/CommunityPages';
import {EventDetailPage,EventsPage,SponsorsPage} from './pages/ExtraPages';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import AdminPlayerApplicationsPage from './pages/AdminPlayerApplicationsPage';

export default function App(){return <Routes><Route element={<Layout/>}><Route index element={<HomePage/>}/><Route path="login" element={<LoginPage/>}/><Route path="signup" element={<SignupPage/>}/><Route path="news" element={<NewsListPage/>}/><Route path="news/:id" element={<NewsDetailPage/>}/><Route path="players" element={<PlayersPage/>}/><Route path="players/:id" element={<PlayerDetailPage/>}/><Route path="matches" element={<MatchesPage/>}/><Route path="standings" element={<StandingsPage/>}/><Route path="boards/:boardType" element={<BoardListPage/>}/><Route path="boards/:boardType/:postId" element={<PostDetailPage/>}/><Route path="sponsors" element={<SponsorsPage/>}/><Route path="events" element={<EventsPage/>}/><Route path="events/:id" element={<EventDetailPage/>}/><Route element={<ProtectedRoute/>}><Route path="boards/:boardType/write" element={<PostWritePage/>}/><Route path="mypage" element={<MyPage/>}/><Route path="players/apply" element={<PlayerApplicationPage/>}/><Route path="players/my-applications" element={<MyPlayerApplicationsPage/>}/></Route><Route element={<ProtectedRoute admin/>}><Route path="admin" element={<AdminPage/>}/><Route path="admin/player-applications" element={<AdminPlayerApplicationsPage/>}/></Route><Route path="*" element={<NotFound/>}/></Route></Routes>}
