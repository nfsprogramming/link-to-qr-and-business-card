
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type CardData, initialCardData, type SocialLink } from '../types';
import { PhonePreview } from '../components/card/PhonePreview';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Icon } from '../components/ui/Icon';
import { ShareModal } from '../components/card/ShareModal';
import { resizeImage } from '../utils/image';
import { saveCardToFirebase, getCardFromFirebase } from '../utils/firebase';
import {
    User,
    Link as LinkIcon,
    Palette,
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    Image as ImageIcon,
    Share2
} from 'lucide-react';

export function CardEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'details' | 'links' | 'design'>('details');
    // Deep copy initial state to avoid reference issues
    const [data, setData] = useState<CardData>(() => JSON.parse(JSON.stringify(initialCardData)));
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data on mount if ID exists
    useEffect(() => {
        if (id) {
            // First try local storage for speed/offline
            const saved = localStorage.getItem(`card-${id}`);
            if (saved) {
                setData(JSON.parse(saved));
            }

            // Then fetch from Firebase to ensure latest version
            getCardFromFirebase(id).then(card => {
                if (card) {
                    setData(card as CardData);
                    // Update local storage to keep in sync
                    localStorage.setItem(`card-${id}`, JSON.stringify(card));
                }
            }).catch(err => console.error("Failed to fetch card", err));
        }
    }, [id]);

    const handleSave = async () => {
        const cardId = id || crypto.randomUUID();
        const newData = { ...data, id: cardId };

        try {
            // Save to Local Storage (Backup/Fast)
            localStorage.setItem(`card-${cardId}`, JSON.stringify(newData));

            // Save to Firebase (Cloud)
            await saveCardToFirebase(newData);

            if (!id) {
                navigate(`/editor/${cardId}`, { replace: true });
            } else {
                alert('Card saved to cloud successfully!');
            }
        } catch (e) {
            console.error('Save failed:', e);
            alert('Failed to save to cloud. Please check your internet connection.');
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await resizeImage(file, 300, 300);
            setData(prev => ({ ...prev, avatarUrl: base64 }));
        } catch (error) {
            console.error('Failed to process image:', error);
            alert('Failed to upload image. Please try another file.');
        } finally {
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const addLink = () => {
        const newLink: SocialLink = {
            id: crypto.randomUUID(),
            title: 'New Link',
            url: 'https://',
            icon: 'Link',
            active: true,
        };
        setData({ ...data, links: [...data.links, newLink] });
    };

    const updateLink = (id: string, field: keyof SocialLink, value: any) => {
        setData({
            ...data,
            links: data.links.map(l => l.id === id ? { ...l, [field]: value } : l),
        });
    };

    const removeLink = (id: string) => {
        setData({
            ...data,
            links: data.links.filter(l => l.id !== id),
        });
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">

            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors touch-manipulation"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm sm:text-base">Back to Dashboard</span>
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                    {id && (
                        <Button
                            variant="secondary"
                            onClick={() => setShareModalOpen(true)}
                            className="flex items-center gap-2 flex-1 sm:flex-initial justify-center touch-manipulation"
                        >
                            <Share2 size={18} />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    )}
                    <Button onClick={handleSave} className="flex items-center gap-2 flex-1 sm:flex-initial justify-center touch-manipulation">
                        <Save size={18} />
                        <span className="hidden sm:inline">Save Card</span>
                        <span className="sm:hidden">Save</span>
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">

                {/* Editor Panel */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col">

                    {/* Tabs */}
                    <div className="flex gap-1 sm:gap-2 p-1 bg-slate-950/50 rounded-lg mb-4 sm:mb-6 shrink-0">
                        {[
                            { id: 'details', label: 'Details', icon: User },
                            { id: 'links', label: 'Links', icon: LinkIcon },
                            { id: 'design', label: 'Design', icon: Palette },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation ${activeTab === tab.id
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <tab.icon size={16} className="hidden sm:block" />
                                <tab.icon size={14} className="sm:hidden" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent max-h-[60vh] sm:max-h-none">

                        {activeTab === 'details' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-center mb-4 sm:mb-6">
                                    <div
                                        className="relative group cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-700 hover:border-sky-500 transition-colors shadow-xl touch-manipulation"
                                        onClick={triggerFileUpload}
                                    >
                                        <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity backdrop-blur-[2px]">
                                            <ImageIcon className="text-white mb-1" size={20} />
                                            <span className="text-white text-xs font-medium">Change Photo</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="text-center mb-4">
                                    <button
                                        onClick={triggerFileUpload}
                                        className="text-sm text-sky-400 hover:text-sky-300 font-medium touch-manipulation"
                                    >
                                        Upload New Image
                                    </button>
                                </div>

                                <Input
                                    label="Full Name"
                                    value={data.fullName}
                                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                                    placeholder="e.g. Alex Doe"
                                />
                                <Input
                                    label="Job Title"
                                    value={data.jobTitle}
                                    onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                                    placeholder="e.g. Product Designer"
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Bio</label>
                                    <textarea
                                        value={data.bio}
                                        onChange={(e) => setData({ ...data, bio: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px] resize-none"
                                        placeholder="Tell your story..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'links' && (
                            <div className="space-y-4 animate-fade-in">
                                {data.links.map((link) => (
                                    <div key={link.id} className="bg-slate-950/30 p-3 sm:p-4 rounded-xl border border-slate-800/50 group">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <Icon name={link.icon} size={16} className="text-slate-400" />
                                            </div>
                                            <div className="flex-1 font-medium text-slate-200 text-sm sm:text-base truncate">
                                                {link.title}
                                            </div>
                                            <button
                                                onClick={() => removeLink(link.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 transition-colors touch-manipulation"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="w-full sm:w-1/3">
                                                    <select
                                                        value={link.icon}
                                                        onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                    >
                                                        <option value="Link">Link</option>
                                                        <option value="Globe">Website</option>
                                                        <option value="Github">Github</option>
                                                        <option value="Linkedin">LinkedIn</option>
                                                        <option value="Twitter">Twitter</option>
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="Facebook">Facebook</option>
                                                        <option value="Youtube">YouTube</option>
                                                        <option value="Twitch">Twitch</option>
                                                        <option value="Mail">Email</option>
                                                        <option value="Phone">Phone</option>
                                                        <option value="MapPin">Location</option>
                                                        <option value="Music">Music</option>
                                                        <option value="Video">Video</option>
                                                        <option value="FileText">Document</option>
                                                        <option value="LeetCode">LeetCode</option>
                                                        <option value="Code">Code</option>
                                                    </select>
                                                </div>
                                                <Input
                                                    placeholder="Title (e.g. My Portfolio)"
                                                    value={link.title}
                                                    onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                                    className="bg-slate-900 border-slate-800 flex-1"
                                                />
                                            </div>
                                            <Input
                                                placeholder="URL (https://...)"
                                                value={link.url}
                                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                                className="bg-slate-900 border-slate-800"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addLink}
                                    className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 touch-manipulation"
                                >
                                    <Plus size={18} />
                                    Add Link
                                </button>
                            </div>
                        )}

                        {activeTab === 'design' && (
                            <div className="space-y-6 sm:space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-4">Card Style</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['modern', 'glass', 'neon', 'classic'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setData({ ...data, theme: { ...data.theme, style: style as any } })}
                                                className={`p-3 sm:p-4 rounded-xl border text-left transition-all touch-manipulation ${data.theme.style === style
                                                    ? 'border-sky-500 bg-sky-500/10 text-white'
                                                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="capitalize font-medium mb-1 text-sm sm:text-base">{style}</div>
                                                <div className="text-xs opacity-60">
                                                    {style === 'glass' ? 'Blurred background' : style === 'neon' ? 'Glowing borders' : 'Clean layout'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-4">Font Family</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Inter', 'Roboto', 'Playfair Display', 'Mono'].map((font) => (
                                            <button
                                                key={font}
                                                onClick={() => setData({ ...data, theme: { ...data.theme, fontFamily: font } })}
                                                className={`px-3 sm:px-4 py-2 rounded-lg text-sm border transition-colors touch-manipulation ${data.theme.fontFamily === font
                                                    ? 'border-sky-500 text-sky-400 bg-sky-950/30'
                                                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                                                    }`}
                                            >
                                                {font}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>


                </div>

                {/* Preview Panel - Now visible on mobile with better layout */}
                <div className="flex items-center justify-center relative order-first lg:order-last">
                    <div className="w-full max-w-sm lg:sticky lg:top-24">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500/20 to-purple-500/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
                        <PhonePreview data={data} />
                    </div>
                </div>

            </div>

            <ShareModal
                card={data}
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
            />
        </div>
    );
}
