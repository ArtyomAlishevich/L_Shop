import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IBoardGame } from '../types';
import { boardGamesApi } from '../api/boardGames';
import { commentsApi, IComment } from '../api/comments';
import { useAuth } from '../hooks/useAuth';
import { useBasket } from '../hooks/useBasket';
import { useLocale } from '../context/LocaleContext';
import './GamesPage.css';

const renderStars = (rating: number, max = 5) => {
    return Array.from({ length: max }, (_, i) => i < Math.round(rating) ? '★' : '☆').join('');
};

const getReviewCountText = (count: number, locale: string) => {
    if (locale === 'en') return `${count} ${count === 1 ? 'review' : 'reviews'}`;
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 14) return `${count} отзывов`;
    if (mod10 === 1) return `${count} отзыв`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} отзыва`;
    return `${count} отзывов`;
};

export const GamePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { addToBasket } = useBasket();
    const { t, locale } = useLocale();
    const tp = t.gamePage;

    const [game, setGame] = useState<IBoardGame | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    useEffect(() => {
        if (id) loadData();
    }, [id, locale]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [gameData, commentsData] = await Promise.all([
                boardGamesApi.getById(id!),
                commentsApi.getByBoardGameId(id!),
            ]);
            setGame(gameData);
            setComments(commentsData);
            setSelectedImage(gameData.images?.preview || '');

            if (isAuthenticated) {
                const liked = await boardGamesApi.getLikedGames();
                setIsLiked(liked.includes(id!));
            }
        } catch {
            setError(tp.notFound);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToBasket = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        try {
            await addToBasket(id!);
            alert(tp.addedToBasket);
        } catch {
            alert(tp.addError);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        setLikeLoading(true);
        try {
            if (isLiked) {
                await boardGamesApi.unlike(id!);
                setIsLiked(false);
            } else {
                await boardGamesApi.like(id!);
                setIsLiked(true);
            }
        } catch {
        } finally {
            setLikeLoading(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        setCommentError('');
        if (rating === 0) { setCommentError(tp.ratingRequired); return; }
        setIsSubmitting(true);
        try {
            const newComment = await commentsApi.add({
                boardGameId: id!,
                rating,
                text: commentText.trim() || undefined,
            });
            setComments(prev => [newComment, ...prev]);
            setRating(0);
            setCommentText('');
        } catch (err: any) {
            setCommentError(err.response?.data?.error || tp.reviewError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm(tp.deleteReviewConfirm)) return;
        try {
            await commentsApi.delete(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch {
            alert(tp.deleteReviewError);
        }
    };

    const averageRating = comments.length > 0
        ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
        : 0;

    const userAlreadyCommented = comments.some(c => c.userId === user?.id);

    if (isLoading) return <div className="game-page-loading">{tp.loading}</div>;
    if (error || !game) return <div className="game-page-error">{error || tp.notFound}</div>;

    const discountedPrice = game.discount ? game.price * (1 - game.discount / 100) : null;
    const allImages = [game.images?.preview, ...(game.images?.gallery || [])].filter(Boolean) as string[];

    return (
        <div className="game-page">
            <div className="game-info">
                <div className="game-gallery">
                    {selectedImage && (
                        <img src={selectedImage} alt={game.name} className="game-main-image" />
                    )}
                    {allImages.length > 1 && (
                        <div className="game-thumbnails">
                            {allImages.map((img, i) => (
                                <img key={i} src={img} alt={`${game.name} ${i + 1}`}
                                     className={`game-thumb ${selectedImage === img ? 'active' : ''}`}
                                     onClick={() => setSelectedImage(img)} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="game-details">
                    <h1>{game.name}</h1>

                    <div className="game-rating-summary">
                        <span className="stars-display">{renderStars(averageRating)}</span>
                        {averageRating > 0 && <span className="rating-value">{averageRating.toFixed(1)}</span>}
                        <span className="rating-count">
                            {comments.length > 0 ? getReviewCountText(comments.length, locale) : tp.noRating}
                        </span>
                    </div>

                    <div className="game-categories">
                        {game.categories.map(cat => (
                            <span key={cat} className="category-tag">{cat}</span>
                        ))}
                    </div>

                    <p className="game-description">{game.description}</p>

                    <div className="game-meta">
                        <span>👥 {game.minPlayers}–{game.maxPlayers} {tp.players}</span>
                        <span>📦 {game.amount} {tp.inStockCount}</span>
                        {game.isAvailable
                            ? <span style={{ color: '#2e7d32' }}>✅ {tp.inStock}</span>
                            : <span style={{ color: '#c62828' }}>❌ {tp.outOfStock}</span>}
                    </div>

                    <div className="game-price-block">
                        {discountedPrice ? (
                            <>
                                <span className="price-original">{game.price} {tp.currency}</span>
                                <span className="price-discounted">{discountedPrice.toFixed(0)} {tp.currency}</span>
                                <span className="discount-badge">−{game.discount}%</span>
                            </>
                        ) : (
                            <span className="price-regular">{game.price} {tp.currency}</span>
                        )}
                    </div>

                    <button className="add-to-basket-btn" onClick={handleAddToBasket} disabled={!game.isAvailable}>
                        {game.isAvailable ? tp.addToBasket : tp.outOfStockBtn}
                    </button>

                    <div className="like-section">
                        <button
                            className={`like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                            disabled={likeLoading}
                        >
                            {isLiked ? tp.liked : tp.like}
                        </button>
                        {!isAuthenticated && (
                            <span className="like-hint">{tp.likeHint}</span>
                        )}
                    </div>

                    {game.delivery && (
                        <div className="delivery-info">
                            <h4>{tp.delivery}</h4>
                            <p>{tp.deliveryFrom} {game.delivery.startCountry}, {game.delivery.startTown}, {tp.street} {game.delivery.startStreet}, {tp.house} {game.delivery.startHouseNumber}</p>
                            <p>{tp.deliveryCost} {game.delivery.price} {tp.currency}</p>
                            <p>{tp.deliveryDate} {new Date(game.delivery.closestDate).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB')}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="comments-section">
                <h2>{tp.reviews}</h2>

                {isAuthenticated ? (
                    !userAlreadyCommented ? (
                        <div className="add-comment-form">
                            <h3>{tp.leaveReview}</h3>
                            <form onSubmit={handleSubmitComment}>
                                <div className="rating-select">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button"
                                                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}>★</button>
                                    ))}
                                </div>
                                {commentError && <div className="comment-error">{commentError}</div>}
                                <textarea className="comment-textarea" placeholder={tp.reviewPlaceholder}
                                          value={commentText} onChange={e => setCommentText(e.target.value)} />
                                <button type="submit" className="submit-comment-btn" disabled={isSubmitting}>
                                    {isSubmitting ? tp.submitting : tp.submitReview}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="login-to-comment">{tp.alreadyReviewed}</div>
                    )
                ) : (
                    <div className="login-to-comment">
                        <Link to="/login">{tp.loginLink}</Link>, {tp.loginToReview}
                    </div>
                )}

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <div className="no-comments">{tp.noReviews}</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <div className="comment-header">
                                    <div className="comment-author-block">
                                        <span className="comment-author">{comment.userName}</span>
                                        <span className="comment-date">{comment.createdAt}</span>
                                    </div>
                                    <span className="comment-rating">{renderStars(comment.rating)}</span>
                                </div>
                                {comment.text && <p className="comment-text">{comment.text}</p>}
                                {comment.userId === user?.id && (
                                    <button className="delete-comment-btn" onClick={() => handleDeleteComment(comment.id)}>
                                        {tp.deleteReview}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};