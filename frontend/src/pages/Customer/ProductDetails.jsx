import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Star, ShoppingCart, MapPin, Package, ArrowLeft, Send, Check } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Selected Options
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Reviews submission
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchProductDetails = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        if (res.data.product.images.length > 0) {
          setActiveImage(res.data.product.images[0]);
        }
        
        // Initialize default variants
        const defaults = {};
        res.data.product.variants.forEach((v) => {
          if (v.options && v.options.length > 0) {
            defaults[v.name] = v.options[0];
          }
        });
        setSelectedVariants(defaults);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Build chosen variant string, e.g. "Size: M, Color: Black"
    const variantString = Object.entries(selectedVariants)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');

    const cartItemId = `${product._id}-${variantString}`;
    const existing = cart.find((item) => item.cartItemId === cartItemId);

    if (existing) {
      if (existing.quantity + quantity > product.stockQuantity) {
        alert(`Cannot add. Exceeds available stock of ${product.stockQuantity}.`);
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({
        cartItemId,
        productId: product._id,
        name: product.name,
        price: product.salePrice,
        quantity,
        image: product.images[0] || '',
        variant: variantString,
        stockQuantity: product.stockQuantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    alert('Product added to cart!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await api.post(`/products/${id}/reviews`, { rating, comment });
      if (res.data.success) {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        setRating(5);
        fetchProductDetails(); // Re-fetch reviews list
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-slate-500">
        Product not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-10">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      {/* Main product view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="w-full h-80 md:h-[400px] bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-primary-500 tracking-wider">
              {product.category?.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                {product.averageRating.toFixed(1)} ({product.reviewsCount} reviews)
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-4 h-4" />
                {product.branch?.name}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Price in Rs.</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">Rs. {product.salePrice}</span>
                {product.salePrice < product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through font-semibold mb-1">
                    Rs. {product.originalPrice}
                  </span>
                )}
              </div>
            </div>
            
            {/* Stock status */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Availability</span>
              <span className={`text-xs font-bold flex items-center gap-1 justify-end mt-1 ${product.stockQuantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <Package className="w-4 h-4" />
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 border-t border-b border-slate-100 dark:border-slate-800 py-4">
              {product.variants.map((variant) => (
                <div key={variant._id} className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">{variant.name}</span>
                  <div className="flex gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedVariants[variant.name] === opt ? 'bg-primary-600 border-primary-600 text-white shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart Actions */}
          {product.stockQuantity > 0 && (
            <div className="flex gap-4 items-center">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  -
                </button>
                <span className="px-4 font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-3.5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-primary-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4">{t('specifications')}</h3>
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {Object.entries(product.specifications).map(([key, value], idx) => (
              <div
                key={key}
                className={`grid grid-cols-3 p-3.5 text-sm ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-950/20' : 'bg-transparent'} border-b border-slate-100 dark:border-slate-800 last:border-b-0`}
              >
                <span className="font-bold text-slate-400">{key}</span>
                <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews & Submission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-4">{t('reviews')}</h3>
          {product.reviews.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No reviews submitted yet for this product.</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rev.userName}</span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {rev.rating}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review */}
        <div>
          {user && user.role === 'customer' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">
                Write a Review
              </h3>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg">
                  {reviewSuccess}
                </div>
              )}
              {reviewError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating select stars */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400">Rating Stars</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= rating ? 'text-amber-500 fill-current' : 'text-slate-200 dark:text-slate-800'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400">Comment</span>
                  <textarea
                    required
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {reviewLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center rounded-2xl text-xs text-slate-400">
              Only logged in customers can submit product reviews.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
