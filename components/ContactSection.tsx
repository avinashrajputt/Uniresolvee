"use client";

import React, { useState, useCallback } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, User, MessageSquare } from 'lucide-react';

const ContactSection = React.memo(function ContactSection() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('sending');

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message: `${subject}\n\n${message}` }),
			});

			if (res.ok) {
				setStatus('success');
				setName(''); setEmail(''); setSubject(''); setMessage('');
			} else {
				setStatus('error');
			}
		} catch (error) {
			void error;
			setStatus('error');
		}
	}, []);

	return (
		<section id="contact" className="w-full py-12 text-white bg-gradient-to-b from-[#071026] via-[#0a1435] to-[#071026] relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute top-10 left-10 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl"></div>
			
			<div className="max-w-4xl mx-auto px-6 relative z-10">
				<div className="text-center mb-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 mb-6 backdrop-blur-sm">
						<Mail className="h-4 w-4 text-pink-400" />
						<span className="text-sm font-medium text-pink-300">Get in Touch</span>
					</div>
					
					<h2 className="text-3xl md:text-4xl lg:text-4xl font-extrabold mb-3">
						<span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Contact Us</span>
					</h2>
					<p className="text-base text-gray-300 max-w-2xl mx-auto">Have questions or want a demo? Send us a message and we will get back to you within 48 hours.</p>
				</div>

				<div className="relative rounded-2xl bg-gradient-to-br from-[#0b1220]/80 to-[#0f1a2b]/80 border-2 border-white/10 backdrop-blur-sm p-6 md:p-8 shadow-2xl">
					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-purple-600/5 rounded-2xl"></div>
					
					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-5">
							<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-lg">
								<MessageSquare className="h-5 w-5 text-white" />
							</div>
							<h3 className="text-xl font-bold text-white">Send a message</h3>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
										<User className="h-4 w-4" />
										Full Name <span className="text-red-400">*</span>
									</label>
									<input 
										value={name} 
										onChange={(e) => setName(e.target.value)} 
										required 
										placeholder="John Doe" 
										className="w-full px-3 py-2 rounded-xl bg-[#061023]/80 border-2 border-white/10 text-white outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 placeholder:text-gray-500" 
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
										<Mail className="h-4 w-4" />
										Email Address <span className="text-red-400">*</span>
									</label>
									<input 
										type="email" 
										value={email} 
										onChange={(e) => setEmail(e.target.value)} 
										required 
										placeholder="john@example.com" 
										className="w-full px-3 py-2 rounded-xl bg-[#061023]/80 border-2 border-white/10 text-white outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 placeholder:text-gray-500" 
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold text-gray-300">Subject</label>
								<input 
									value={subject} 
									onChange={(e) => setSubject(e.target.value)} 
									placeholder="How can we help you?" 
									className="w-full px-3 py-2 rounded-xl bg-[#061023]/80 border-2 border-white/10 text-white outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 placeholder:text-gray-500" 
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold text-gray-300">Message</label>
								<textarea 
									value={message} 
									onChange={(e) => setMessage(e.target.value)} 
									rows={4} 
									placeholder="Tell us more about your needs..." 
									className="w-full px-3 py-2 rounded-xl bg-[#061023]/80 border-2 border-white/10 text-white outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 resize-none placeholder:text-gray-500" 
								/>
							</div>

							<div className="flex items-center justify-between pt-2">
								<div className="flex-1">
									{status === 'success' && (
										<div className="flex items-center gap-2 text-green-400">
											<CheckCircle className="h-5 w-5" />
											<span className="text-sm font-medium">Message sent successfully!</span>
										</div>
									)}
									{status === 'error' && (
										<div className="flex items-center gap-2 text-red-400">
											<AlertCircle className="h-5 w-5" />
											<span className="text-sm font-medium">Failed to send. Please try again.</span>
										</div>
									)}
								</div>
								<button 
									type="submit" 
									disabled={status === 'sending'} 
									className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
								>
									{status === 'sending' ? (
										<>
											<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
											Sending...
										</>
									) : (
										<>
											<Send className="h-5 w-5" />
											Send Message
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
});

export default ContactSection;
