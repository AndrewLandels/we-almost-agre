import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AboutPage } from './pages/AboutPage'
import { AgreeLayout } from './pages/agree/AgreeLayout'
import { AnswerPage } from './pages/agree/AnswerPage'
import { ComparePage } from './pages/agree/ComparePage'
import { TopicListPage } from './pages/agree/TopicListPage'
import { BlogIndexPage } from './pages/BlogIndexPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { BookPage } from './pages/BookPage'
import { ClaimPage } from './pages/ClaimPage'
import { DeeperPage } from './pages/DeeperPage'
import { ExpressPage } from './pages/ExpressPage'
import { HomePage } from './pages/HomePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/agree" element={<AgreeLayout />}>
        <Route index element={<TopicListPage />} />
        <Route path="t/:topicId" element={<AnswerPage />} />
        <Route path="c/:code" element={<ComparePage />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/express/:id" element={<ExpressPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/deeper" element={<DeeperPage />} />
        <Route path="/claim/:id" element={<ClaimPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
