import React, { useState, useEffect } from 'react';
import { MessageCircleQuestion, ThumbsUp, ThumbsDown, MessageSquare, Plus, X, Loader2, ShieldCheck, User, ImagePlus } from 'lucide-react';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode';

const SharedForum = () => {
  const [userRole, setUserRole] = useState('STUDENT');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAsking, setIsAsking] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', image: null });
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('edusync_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role?.toUpperCase() || 'STUDENT');
      } catch (e) {
        console.error("Invalid token");
      }
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/forum/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewQuestion({ ...newQuestion, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', newQuestion.title);
      formData.append('content', newQuestion.content || '');
      
      if (newQuestion.image) {
        formData.append('file', newQuestion.image); 
      }

      await apiClient.post('/api/v1/forum/questions', formData, {
        headers: { 'Content-Type': undefined },
      });
      
      setIsAsking(false);
      setNewQuestion({ title: '', content: '', image: null });
      setImagePreview(null);
      fetchQuestions(); 
      
    } catch (error) {
      console.error("Error posting question:", error);
      alert(error.response?.data?.detail || "Failed to post question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleExpand = async (questionId) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
      setExpandedData(null);
      return;
    }

    setExpandedQuestionId(questionId);
    setIsExpanding(true);
    
    try {
      const response = await apiClient.get(`/api/v1/forum/questions/${questionId}`);
      setExpandedData(response.data);
    } catch (error) {
      console.error("Error fetching answers:", error);
      alert("Failed to load answers.");
      setExpandedQuestionId(null);
    } finally {
      setIsExpanding(false);
    }
  };

  const handlePostAnswer = async (e, questionId) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setIsSubmitting(true);

    try {
      await apiClient.post(`/api/v1/forum/questions/${questionId}/answers`, {
        content: newAnswer
      });
      setNewAnswer('');
      const response = await apiClient.get(`/api/v1/forum/questions/${questionId}`);
      setExpandedData(response.data);
      
    } catch (error) {
      console.error("Answer error:", error);
      alert(error.response?.data?.detail || "Failed to post answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (answerId, voteType) => {
    const currentVote = userVotes[answerId] || 0;
    const newVote = currentVote === voteType ? 0 : voteType;

    setUserVotes(prev => ({ ...prev, [answerId]: newVote }));

    try {
      const response = await apiClient.post(`/api/v1/forum/answers/${answerId}/vote`, {
        vote: newVote
      });

      const { upvotes, downvotes } = response.data;

      setExpandedData((prevData) => {
        if (!prevData) return prevData;
        const updatedAnswers = prevData.answers.map(ans => {
          if (ans.id === answerId) {
            return { ...ans, upvotes, downvotes }; 
          }
          return ans;
        });
        return { ...prevData, answers: updatedAnswers };
      });

    } catch (error) {
      console.error("Vote error:", error);
      setUserVotes(prev => ({ ...prev, [answerId]: currentVote }));
      alert(error.response?.data?.detail || "Failed to register vote.");
    }
  };

  const handleToggleVerify = async (answerId, currentStatus) => {
    // Optimistic UI update (feels instant to the user)
    setExpandedData((prevData) => {
      if (!prevData) return prevData;
      const updatedAnswers = prevData.answers.map(ans => {
        if (ans.id === answerId) {
          return { ...ans, is_professor_verified: !currentStatus };
        }
        return ans;
      });
      return { ...prevData, answers: updatedAnswers };
    });

    try {
      // Actually hit the new FastAPI endpoints
      if (currentStatus) {
        await apiClient.patch(`/api/v1/forum/answers/${answerId}/unverify`);
      } else {
        await apiClient.patch(`/api/v1/forum/answers/${answerId}/verify`);
      }
    } catch (error) {
      console.error("Verification error:", error);
      // If the backend fails, revert the button back to its previous state
      setExpandedData((prevData) => {
        if (!prevData) return prevData;
        const revertedAnswers = prevData.answers.map(ans => {
          if (ans.id === answerId) {
            return { ...ans, is_professor_verified: currentStatus };
          }
          return ans;
        });
        return { ...prevData, answers: revertedAnswers };
      });
      alert(error.response?.data?.detail || "Failed to update official status.");
    }
  };

  const getAuthorName = (item, defaultName) => {
    if (!item) return defaultName;
    if (item.author?.full_name) return item.author.full_name;
    if (item.user?.full_name) return item.user.full_name;
    if (item.creator?.full_name) return item.creator.full_name;
    if (item.author_name) return item.author_name;
    if (item.user_name) return item.user_name;
    if (item.full_name) return item.full_name;
    if (item.author_id) return `User #${item.author_id}`;
    if (item.user_id) return `User #${item.user_id}`;
    return defaultName;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <MessageCircleQuestion className="w-6 h-6 mr-3 text-indigo-600" /> Doubt Forum
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Ask questions, share answers, and learn together.</p>
        </div>
        
        <button 
          onClick={() => setIsAsking(true)}
          className="mt-4 sm:mt-0 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Ask a Doubt
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : questions.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <MessageCircleQuestion className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-700">No doubts posted yet.</p>
          <p className="text-sm mt-1">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const questionAuthor = getAuthorName(q, 'Student');
            
            return (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:border-indigo-300">
              
              <div 
                className="p-6 cursor-pointer" 
                onClick={() => handleToggleExpand(q.id)}
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2">{q.title}</h3>
                {q.content && <p className="text-sm text-slate-600 mb-4 line-clamp-2">{q.content}</p>}
                
                {q.file_url && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-64 flex justify-center">
                    <img src={q.file_url} alt="Question Attachment" className="object-contain w-full h-full max-h-64" />
                  </div>
                )}
                
                <div className="flex items-center text-xs text-slate-500 mt-2 space-x-4 font-medium">
                  <span className="flex items-center text-slate-700 font-bold">
                    <User className="w-4 h-4 mr-1.5 text-slate-400" /> {questionAuthor}
                  </span>
                  <span>•</span>
                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> 
                    {expandedQuestionId === q.id ? 'Hide Answers' : 'View Answers'}
                  </span>
                </div>
              </div>

              {expandedQuestionId === q.id && (
                <div className="bg-slate-50 border-t border-slate-200 p-6 animate-in slide-in-from-top-4 duration-300">
                  {isExpanding ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                  ) : (
                    <div className="space-y-6">
                      
                      {expandedData?.answers?.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Answers ({expandedData.answers.length})</h4>
                          
                          {expandedData.answers.map((ans) => {
                            const isVerified = ans.is_professor_verified;
                            const answerAuthor = getAuthorName(ans, 'User');
                            const answerInitial = answerAuthor.charAt(0).toUpperCase();
                            
                            return (
                              <div key={ans.id} className={`p-4 rounded-xl border transition-all ${isVerified ? 'bg-green-50/50 border-green-300 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm transition-colors ${isVerified ? 'bg-green-600' : 'bg-indigo-500'}`}>
                                      {answerInitial}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{answerAuthor}</p>
                                      {isVerified && (
                                        <p className="text-[10px] text-green-700 font-bold flex items-center mt-0.5 animate-in fade-in">
                                          <ShieldCheck className="w-3 h-3 mr-1" /> Professor's Choice
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap pl-11">{ans.content}</p>
                                
                                <div className="mt-4 pl-11 flex items-center flex-wrap gap-2">
                                  
                                  <button 
                                    onClick={() => handleVote(ans.id, 1)}
                                    className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                      userVotes[ans.id] === 1 
                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                                        : 'text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-transparent'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-4 h-4 mr-1.5 ${userVotes[ans.id] === 1 ? 'fill-indigo-600 text-indigo-600' : ''}`} /> 
                                    {ans.upvotes || 0}
                                  </button>

                                  <button 
                                    onClick={() => handleVote(ans.id, -1)}
                                    className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                      userVotes[ans.id] === -1 
                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                        : 'text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-transparent'
                                    }`}
                                  >
                                    <ThumbsDown className={`w-4 h-4 mr-1.5 ${userVotes[ans.id] === -1 ? 'fill-red-600 text-red-600' : ''}`} /> 
                                    {ans.downvotes || 0}
                                  </button>

                                  {/* FIXED: ONLY the Professor can mark official! */}
                                  {userRole === 'PROFESSOR' && (
                                    <button 
                                      onClick={() => handleToggleVerify(ans.id, isVerified)}
                                      className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ml-auto ${
                                        isVerified 
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                                          : 'text-slate-500 hover:text-green-600 bg-slate-100 hover:bg-green-50 border border-transparent'
                                      }`}
                                    >
                                      <ShieldCheck className={`w-4 h-4 mr-1.5 ${isVerified ? 'text-green-600' : ''}`} /> 
                                      {isVerified ? 'Unmark Official' : 'Mark Official'}
                                    </button>
                                  )}

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 text-sm bg-white rounded-xl border border-slate-200 shadow-sm">
                          No answers yet. Can you help?
                        </div>
                      )}

                      <form onSubmit={(e) => handlePostAnswer(e, q.id)} className="mt-6 flex flex-col items-end border-t border-slate-200 pt-6">
                        <textarea 
                          required
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          placeholder="Write your answer..."
                          className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-sm resize-y bg-white"
                        ></textarea>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="mt-3 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-70"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Post Answer
                        </button>
                      </form>

                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Ask Question Modal */}
      {isAsking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Ask a Doubt</h3>
              <button 
                onClick={() => { setIsAsking(false); setImagePreview(null); }} 
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAskQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Question Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={newQuestion.title} 
                  onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})} 
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" 
                  placeholder="E.g., How does Dijkstra's algorithm work?" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Details & Context</label>
                <textarea 
                  value={newQuestion.content} 
                  onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})} 
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] bg-slate-50" 
                  placeholder="Explain what you are struggling with..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Attach an Image (Optional)</label>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 border border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-100 transition-colors bg-slate-50">
                    <ImagePlus className="w-5 h-5 text-slate-500 mr-2" />
                    <span className="text-sm font-bold text-slate-600">Select Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                  
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                      <button 
                        type="button"
                        onClick={() => { setNewQuestion({ ...newQuestion, image: null }); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => { setIsAsking(false); setImagePreview(null); }} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedForum;