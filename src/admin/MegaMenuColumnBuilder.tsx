/**
 * Section D — Mega Menu Content Builder
 * Visual column-based menu editor (MegaMenuColumnBuilder & MegaMenuColumn)
 *
 * @package starter-theme
 */

import { useState } from '@wordpress/element';
import { MenuItem, MenuColumn, MenuLinkItem } from './types';

interface MegaMenuColumnProps {
	column: MenuColumn;
	index: number;
	totalColumns: number;
	isSelected: boolean;
	isVisibleInGrid: boolean;
	onSelectColumn: ( colId: string ) => void;
	onUpdateHeading: ( colId: string, heading: string ) => void;
	onRemoveColumn: ( colId: string ) => void;
	onMoveColumn: ( index: number, direction: -1 | 1 ) => void;
	onAddLink: ( colId: string, label: string, url: string ) => void;
	onRemoveLink: ( colId: string, linkId: string ) => void;
	onMoveLink: ( colId: string, linkIdx: number, direction: -1 | 1 ) => void;
	onAddSubLink: ( colId: string, linkId: string, label: string, url: string ) => void;
	onRemoveSubLink: ( colId: string, linkId: string, subLinkId: string ) => void;
	onMoveSubLink: ( colId: string, linkId: string, subIdx: number, direction: -1 | 1 ) => void;
	onDragStartColumn: ( index: number ) => void;
	onDragOverColumn: ( e: React.DragEvent, index: number ) => void;
	onDropColumn: ( index: number ) => void;
}

export const MegaMenuColumn = ( {
	column,
	index,
	totalColumns,
	isSelected,
	isVisibleInGrid,
	onSelectColumn,
	onUpdateHeading,
	onRemoveColumn,
	onMoveColumn,
	onAddLink,
	onRemoveLink,
	onMoveLink,
	onAddSubLink,
	onRemoveSubLink,
	onMoveSubLink,
	onDragStartColumn,
	onDragOverColumn,
	onDropColumn,
}: MegaMenuColumnProps ) => {
	const [ isAddingLink, setIsAddingLink ] = useState<boolean>( false );
	const [ newLinkLabel, setNewLinkLabel ] = useState<string>( '' );
	const [ newLinkUrl, setNewLinkUrl ] = useState<string>( '' );
	const [ draggedLinkIdx, setDraggedLinkIdx ] = useState<number | null>( null );
	const [ addingSubForLinkId, setAddingSubForLinkId ] = useState<string | null>( null );
	const [ newSubLabel, setNewSubLabel ] = useState<string>( '' );
	const [ newSubUrl, setNewSubUrl ] = useState<string>( '' );

	const handleCreateLink = () => {
		if ( ! newLinkLabel.trim() ) {
			return;
		}
		onAddLink(
			column.id,
			newLinkLabel.trim(),
			newLinkUrl.trim() || `/${ newLinkLabel.trim().toLowerCase().replace( /\s+/g, '-' ) }`
		);
		setNewLinkLabel( '' );
		setNewLinkUrl( '' );
		setIsAddingLink( false );
	};

	const handleCreateSubLink = ( linkId: string ) => {
		if ( ! newSubLabel.trim() ) {
			return;
		}
		onAddSubLink(
			column.id,
			linkId,
			newSubLabel.trim(),
			newSubUrl.trim() || `/${ newSubLabel.trim().toLowerCase().replace( /\s+/g, '-' ) }`
		);
		setNewSubLabel( '' );
		setNewSubUrl( '' );
		setAddingSubForLinkId( null );
	};

	const handleLinkDrop = ( targetIdx: number ) => {
		if ( draggedLinkIdx === null || draggedLinkIdx === targetIdx ) {
			setDraggedLinkIdx( null );
			return;
		}
		const diff = targetIdx - draggedLinkIdx;
		const step = diff > 0 ? 1 : -1;
		let curr = draggedLinkIdx;
		while ( curr !== targetIdx ) {
			onMoveLink( column.id, curr, step as -1 | 1 );
			curr += step;
		}
		setDraggedLinkIdx( null );
	};

	return (
		<div
			id={ `mm-col-card-${ column.id }` }
			className={ `mm-col-card ${ isSelected ? 'is-selected' : '' }` }
			draggable
			onDragStart={ () => onDragStartColumn( index ) }
			onDragOver={ ( e ) => onDragOverColumn( e, index ) }
			onDrop={ () => onDropColumn( index ) }
			onClick={ () => onSelectColumn( column.id ) }
			style={ {
				background: '#FFFFFF',
				border: isSelected ? '1.5px solid #4169F7' : '1px solid #E2E8F0',
				borderRadius: '10px',
				padding: '12px',
				boxShadow: isSelected
					? '0 4px 12px rgba(65, 105, 247, 0.08)'
					: '0 1px 2px rgba(15, 23, 42, 0.03)',
				transition: 'all 160ms ease',
				cursor: 'pointer',
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
				opacity: isVisibleInGrid ? 1 : 0.65,
			} }
		>
			{ /* Column Header */ }
			<div
				id={ `mm-col-header-${ column.id }` }
				className="mm-col-card__header"
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: '6px',
					paddingBottom: '8px',
					borderBottom: '1px solid #F1F5F9',
				} }
			>
				<span
					id={ `mm-col-drag-${ column.id }` }
					className="mm-col-card__drag"
					title="Drag to reorder column"
					style={ {
						color: '#94A3B8',
						cursor: 'grab',
						display: 'inline-flex',
						alignItems: 'center',
						fontSize: '15px',
					} }
				>
					<i id={ `mm-col-drag-ico-${ column.id }` } className="ri-draggable"></i>
				</span>

				<span
					id={ `mm-col-badge-${ column.id }` }
					className="mm-col-card__badge"
					style={ {
						fontSize: '10px',
						fontWeight: 700,
						padding: '2px 6px',
						borderRadius: '4px',
						background: isSelected ? '#4169F7' : '#F1F5F9',
						color: isSelected ? '#FFFFFF' : '#64748B',
						textTransform: 'uppercase',
						letterSpacing: '0.03em',
						flexShrink: 0,
					} }
				>
					Col { index + 1 }
				</span>

				<input
					id={ `mm-col-heading-input-${ column.id }` }
					className="mm-col-card__heading-input"
					type="text"
					value={ column.heading }
					onClick={ ( e ) => e.stopPropagation() }
					onChange={ ( e ) => onUpdateHeading( column.id, e.target.value ) }
					placeholder="Column Heading"
					style={ {
						flex: 1,
						minWidth: 0,
						border: '1px solid transparent',
						borderRadius: '6px',
						padding: '4px 6px',
						fontSize: '13px',
						fontWeight: 600,
						color: '#0F172A',
						background: 'transparent',
						outline: 'none',
						transition: 'border-color 150ms ease, background 150ms ease',
					} }
					onFocus={ ( e ) => {
						e.currentTarget.style.borderColor = '#CBD5E1';
						e.currentTarget.style.background = '#F8FAFC';
					} }
					onBlur={ ( e ) => {
						e.currentTarget.style.borderColor = 'transparent';
						e.currentTarget.style.background = 'transparent';
					} }
				/>

				<div
					id={ `mm-col-actions-${ column.id }` }
					className="mm-col-card__actions"
					style={ { display: 'flex', alignItems: 'center', gap: '2px' } }
					onClick={ ( e ) => e.stopPropagation() }
				>
					<button
						id={ `mm-col-left-${ column.id }` }
						className="mm-col-card__icon-btn"
						type="button"
						disabled={ index === 0 }
						onClick={ () => onMoveColumn( index, -1 ) }
						title="Move column left"
						style={ {
							width: '22px',
							height: '22px',
							border: 'none',
							background: 'transparent',
							color: index === 0 ? '#CBD5E1' : '#64748B',
							cursor: index === 0 ? 'not-allowed' : 'pointer',
							borderRadius: '4px',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
						} }
					>
						<i id={ `mm-col-left-ico-${ column.id }` } className="ri-arrow-left-s-line"></i>
					</button>
					<button
						id={ `mm-col-right-${ column.id }` }
						className="mm-col-card__icon-btn"
						type="button"
						disabled={ index === totalColumns - 1 }
						onClick={ () => onMoveColumn( index, 1 ) }
						title="Move column right"
						style={ {
							width: '22px',
							height: '22px',
							border: 'none',
							background: 'transparent',
							color: index === totalColumns - 1 ? '#CBD5E1' : '#64748B',
							cursor: index === totalColumns - 1 ? 'not-allowed' : 'pointer',
							borderRadius: '4px',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
						} }
					>
						<i id={ `mm-col-right-ico-${ column.id }` } className="ri-arrow-right-s-line"></i>
					</button>
					<button
						id={ `mm-col-del-${ column.id }` }
						className="mm-col-card__icon-btn"
						type="button"
						onClick={ () => onRemoveColumn( column.id ) }
						title="Remove column"
						style={ {
							width: '22px',
							height: '22px',
							border: 'none',
							background: 'transparent',
							color: '#EF4444',
							cursor: 'pointer',
							borderRadius: '4px',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
						} }
					>
						<i id={ `mm-col-del-ico-${ column.id }` } className="ri-delete-bin-line"></i>
					</button>
				</div>
			</div>

			{ /* Column Links List */ }
			<div
				id={ `mm-col-links-${ column.id }` }
				className="mm-col-card__links"
				style={ {
					display: 'flex',
					flexDirection: 'column',
					gap: '4px',
					minHeight: '72px',
				} }
			>
				{ column.items.length === 0 ? (
					<div
						id={ `mm-col-empty-${ column.id }` }
						className="mm-col-card__empty"
						style={ {
							padding: '16px 8px',
							textAlign: 'center',
							fontSize: '12px',
							color: '#94A3B8',
							border: '1px dashed #E2E8F0',
							borderRadius: '6px',
						} }
					>
						No links yet. Select items from the picker or add below.
					</div>
				) : (
					column.items.map( ( link: MenuLinkItem, linkIdx: number ) => {
						const subLinks = link.children || [];
						const isAddingSub = addingSubForLinkId === link.id;
						return (
							<div
								key={ link.id }
								id={ `mm-col-link-wrap-${ column.id }-${ link.id }` }
								className="mm-col-card__link-group"
								style={ {
									display: 'flex',
									flexDirection: 'column',
									gap: '3px',
								} }
							>
								<div
									id={ `mm-col-link-${ column.id }-${ link.id }` }
									className="mm-col-card__link-row"
									draggable
									onDragStart={ ( e ) => {
										e.stopPropagation();
										setDraggedLinkIdx( linkIdx );
									} }
									onDragOver={ ( e ) => {
										e.preventDefault();
										e.stopPropagation();
									} }
									onDrop={ ( e ) => {
										e.stopPropagation();
										handleLinkDrop( linkIdx );
									} }
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
										padding: '5px 8px',
										borderRadius: '6px',
										background: '#F8FAFC',
										border: '1px solid #F1F5F9',
										fontSize: '12.5px',
										color: '#334155',
									} }
								>
									<span
										id={ `mm-col-link-drag-${ link.id }` }
										className="mm-col-card__link-drag"
										style={ {
											color: '#CBD5E1',
											cursor: 'grab',
											display: 'inline-flex',
											fontSize: '13px',
										} }
									>
										<i id={ `mm-col-link-drag-ico-${ link.id }` } className="ri-draggable"></i>
									</span>

									<span
										id={ `mm-col-link-l3badge-${ link.id }` }
										className="mm-col-card__l3badge"
										style={ {
											fontSize: '9px',
											fontWeight: 700,
											padding: '1px 4px',
											borderRadius: '3px',
											background: '#F0FDF4',
											color: '#15803D',
											border: '1px solid #BBF7D0',
											flexShrink: 0,
										} }
									>
										L3
									</span>

									<span
										id={ `mm-col-link-label-${ link.id }` }
										className="mm-col-card__link-label"
										style={ {
											flex: 1,
											fontWeight: 500,
											color: '#0F172A',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										} }
									>
										{ link.label }
									</span>

									<div
										id={ `mm-col-link-btns-${ link.id }` }
										className="mm-col-card__link-btns"
										style={ { display: 'flex', alignItems: 'center', gap: '2px' } }
										onClick={ ( e ) => e.stopPropagation() }
									>
										<button
											id={ `mm-col-link-addsub-${ link.id }` }
											className="mm-col-card__link-btn"
											type="button"
											onClick={ () => {
												setAddingSubForLinkId( isAddingSub ? null : link.id );
												setNewSubLabel( '' );
												setNewSubUrl( '' );
											} }
											title="Add Level 4 sub-item"
											style={ {
												border: 'none',
												background: isAddingSub ? '#DBEAFE' : 'transparent',
												color: '#4169F7',
												cursor: 'pointer',
												padding: '2px 3px',
												borderRadius: '4px',
												fontSize: '12px',
											} }
										>
											<i id={ `mm-col-link-addsub-ico-${ link.id }` } className="ri-add-line"></i>
										</button>
										<button
											id={ `mm-col-link-up-${ link.id }` }
											className="mm-col-card__link-btn"
											type="button"
											disabled={ linkIdx === 0 }
											onClick={ () => onMoveLink( column.id, linkIdx, -1 ) }
											title="Move link up"
											style={ {
												border: 'none',
												background: 'transparent',
												color: linkIdx === 0 ? '#E2E8F0' : '#94A3B8',
												cursor: linkIdx === 0 ? 'not-allowed' : 'pointer',
												padding: '2px',
												fontSize: '12px',
											} }
										>
											<i id={ `mm-col-link-up-ico-${ link.id }` } className="ri-arrow-up-s-line"></i>
										</button>
										<button
											id={ `mm-col-link-down-${ link.id }` }
											className="mm-col-card__link-btn"
											type="button"
											disabled={ linkIdx === column.items.length - 1 }
											onClick={ () => onMoveLink( column.id, linkIdx, 1 ) }
											title="Move link down"
											style={ {
												border: 'none',
												background: 'transparent',
												color: linkIdx === column.items.length - 1 ? '#E2E8F0' : '#94A3B8',
												cursor: linkIdx === column.items.length - 1 ? 'not-allowed' : 'pointer',
												padding: '2px',
												fontSize: '12px',
											} }
										>
											<i id={ `mm-col-link-down-ico-${ link.id }` } className="ri-arrow-down-s-line"></i>
										</button>
										<button
											id={ `mm-col-link-rm-${ link.id }` }
											className="mm-col-card__link-btn"
											type="button"
											onClick={ () => onRemoveLink( column.id, link.id ) }
											title="Remove link"
											style={ {
												border: 'none',
												background: 'transparent',
												color: '#94A3B8',
												cursor: 'pointer',
												padding: '2px',
												fontSize: '13px',
											} }
										>
											<i id={ `mm-col-link-rm-ico-${ link.id }` } className="ri-close-line"></i>
										</button>
									</div>
								</div>

								{ /* Level 4 Sub-items inside Column */ }
								{ subLinks.length > 0 && (
									<div
										id={ `mm-col-sublinks-${ link.id }` }
										className="mm-col-card__sublinks"
										onClick={ ( e ) => e.stopPropagation() }
										style={ {
											display: 'flex',
											flexDirection: 'column',
											gap: '3px',
											paddingLeft: '14px',
											borderLeft: '2px solid #E2E8F0',
											marginLeft: '8px',
										} }
									>
										{ subLinks.map( ( sub: MenuLinkItem, sIdx: number ) => (
											<div
												key={ sub.id }
												id={ `mm-col-sublink-${ link.id }-${ sub.id }` }
												className="mm-col-card__sublink-row"
												style={ {
													display: 'flex',
													alignItems: 'center',
													gap: '5px',
													padding: '4px 6px',
													borderRadius: '5px',
													background: '#FFFFFF',
													border: '1px solid #E2E8F0',
													fontSize: '11.5px',
													color: '#475569',
												} }
											>
												<span
													id={ `mm-col-sublink-l4badge-${ sub.id }` }
													className="mm-col-card__l4badge"
													style={ {
														fontSize: '8.5px',
														fontWeight: 700,
														padding: '1px 4px',
														borderRadius: '3px',
														background: '#FEF3C7',
														color: '#B45309',
														border: '1px solid #FDE68A',
														flexShrink: 0,
													} }
												>
													L4
												</span>
												<span
													id={ `mm-col-sublink-label-${ sub.id }` }
													className="mm-col-card__sublink-label"
													style={ {
														flex: 1,
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													} }
												>
													{ sub.label }
												</span>
												<button
													id={ `mm-col-sublink-up-${ sub.id }` }
													className="mm-col-card__link-btn"
													type="button"
													disabled={ sIdx === 0 }
													onClick={ () => onMoveSubLink( column.id, link.id, sIdx, -1 ) }
													title="Move up"
													style={ {
														border: 'none',
														background: 'transparent',
														color: sIdx === 0 ? '#E2E8F0' : '#94A3B8',
														cursor: sIdx === 0 ? 'not-allowed' : 'pointer',
														padding: '1px',
														fontSize: '11px',
													} }
												>
													<i id={ `mm-col-sublink-up-ico-${ sub.id }` } className="ri-arrow-up-s-line"></i>
												</button>
												<button
													id={ `mm-col-sublink-down-${ sub.id }` }
													className="mm-col-card__link-btn"
													type="button"
													disabled={ sIdx === subLinks.length - 1 }
													onClick={ () => onMoveSubLink( column.id, link.id, sIdx, 1 ) }
													title="Move down"
													style={ {
														border: 'none',
														background: 'transparent',
														color: sIdx === subLinks.length - 1 ? '#E2E8F0' : '#94A3B8',
														cursor: sIdx === subLinks.length - 1 ? 'not-allowed' : 'pointer',
														padding: '1px',
														fontSize: '11px',
													} }
												>
													<i id={ `mm-col-sublink-down-ico-${ sub.id }` } className="ri-arrow-down-s-line"></i>
												</button>
												<button
													id={ `mm-col-sublink-rm-${ sub.id }` }
													className="mm-col-card__link-btn"
													type="button"
													onClick={ () => onRemoveSubLink( column.id, link.id, sub.id ) }
													title="Remove L4 item"
													style={ {
														border: 'none',
														background: 'transparent',
														color: '#EF4444',
														cursor: 'pointer',
														padding: '1px',
														fontSize: '12px',
													} }
												>
													<i id={ `mm-col-sublink-rm-ico-${ sub.id }` } className="ri-close-line"></i>
												</button>
											</div>
										) ) }
									</div>
								) }

								{ /* Inline Add Level 4 Form */ }
								{ isAddingSub && (
									<div
										id={ `mm-col-add-subform-${ link.id }` }
										className="mm-col-card__add-subform"
										onClick={ ( e ) => e.stopPropagation() }
										style={ {
											display: 'flex',
											flexDirection: 'column',
											gap: '5px',
											padding: '6px 8px',
											marginLeft: '14px',
											background: '#FEFCE8',
											border: '1px solid #FDE68A',
											borderRadius: '6px',
										} }
									>
										<input
											id={ `mm-col-new-sublabel-${ link.id }` }
											className="mm-col-card__input"
											type="text"
											value={ newSubLabel }
											onChange={ ( e ) => setNewSubLabel( e.target.value ) }
											placeholder="Level 4 sub-item label..."
											autoFocus
											style={ {
												width: '100%',
												padding: '4px 7px',
												fontSize: '11.5px',
												border: '1px solid #CBD5E1',
												borderRadius: '4px',
												background: '#FFFFFF',
											} }
										/>
										<input
											id={ `mm-col-new-suburl-${ link.id }` }
											className="mm-col-card__input"
											type="text"
											value={ newSubUrl }
											onChange={ ( e ) => setNewSubUrl( e.target.value ) }
											placeholder="/url-path (optional)"
											style={ {
												width: '100%',
												padding: '4px 7px',
												fontSize: '11.5px',
												border: '1px solid #CBD5E1',
												borderRadius: '4px',
												background: '#FFFFFF',
											} }
										/>
										<div
											id={ `mm-col-add-subbtns-${ link.id }` }
											className="mm-col-card__add-btns"
											style={ { display: 'flex', gap: '4px' } }
										>
											<button
												id={ `mm-col-save-sublink-${ link.id }` }
												className="mm-col-card__save-btn"
												type="button"
												onClick={ () => handleCreateSubLink( link.id ) }
												style={ {
													flex: 1,
													padding: '4px 6px',
													background: '#4169F7',
													color: '#FFFFFF',
													border: 'none',
													borderRadius: '4px',
													fontSize: '11px',
													fontWeight: 600,
													cursor: 'pointer',
												} }
											>
												Add L4
											</button>
											<button
												id={ `mm-col-cancel-sublink-${ link.id }` }
												className="mm-col-card__cancel-btn"
												type="button"
												onClick={ () => setAddingSubForLinkId( null ) }
												style={ {
													padding: '4px 6px',
													background: '#FFFFFF',
													color: '#64748B',
													border: '1px solid #CBD5E1',
													borderRadius: '4px',
													fontSize: '11px',
													cursor: 'pointer',
												} }
											>
												Cancel
											</button>
										</div>
									</div>
								) }
							</div>
						);
					} )
				) }
			</div>

			{ /* Quick Add Link Inside Column */ }
			<div
				id={ `mm-col-footer-${ column.id }` }
				className="mm-col-card__footer"
				onClick={ ( e ) => e.stopPropagation() }
				style={ { marginTop: 'auto', paddingTop: '6px' } }
			>
				{ isAddingLink ? (
					<div
						id={ `mm-col-add-form-${ column.id }` }
						className="mm-col-card__add-form"
						style={ {
							display: 'flex',
							flexDirection: 'column',
							gap: '6px',
							padding: '8px',
							background: '#F8FAFC',
							borderRadius: '8px',
							border: '1px solid #E2E8F0',
						} }
					>
						<input
							id={ `mm-col-new-label-${ column.id }` }
							className="mm-col-card__input"
							type="text"
							value={ newLinkLabel }
							onChange={ ( e ) => setNewLinkLabel( e.target.value ) }
							placeholder="Link label..."
							style={ {
								width: '100%',
								padding: '5px 8px',
								fontSize: '12px',
								border: '1px solid #CBD5E1',
								borderRadius: '5px',
							} }
						/>
						<input
							id={ `mm-col-new-url-${ column.id }` }
							className="mm-col-card__input"
							type="text"
							value={ newLinkUrl }
							onChange={ ( e ) => setNewLinkUrl( e.target.value ) }
							placeholder="/url-path"
							style={ {
								width: '100%',
								padding: '5px 8px',
								fontSize: '12px',
								border: '1px solid #CBD5E1',
								borderRadius: '5px',
							} }
						/>
						<div
							id={ `mm-col-add-btns-${ column.id }` }
							className="mm-col-card__add-btns"
							style={ { display: 'flex', gap: '6px' } }
						>
							<button
								id={ `mm-col-save-link-${ column.id }` }
								className="mm-col-card__save-btn"
								type="button"
								onClick={ handleCreateLink }
								style={ {
									flex: 1,
									padding: '5px 8px',
									background: '#4169F7',
									color: '#FFFFFF',
									border: 'none',
									borderRadius: '5px',
									fontSize: '11.5px',
									fontWeight: 600,
									cursor: 'pointer',
								} }
							>
								Add
							</button>
							<button
								id={ `mm-col-cancel-link-${ column.id }` }
								className="mm-col-card__cancel-btn"
								type="button"
								onClick={ () => setIsAddingLink( false ) }
								style={ {
									padding: '5px 8px',
									background: '#FFFFFF',
									color: '#64748B',
									border: '1px solid #CBD5E1',
									borderRadius: '5px',
									fontSize: '11.5px',
									cursor: 'pointer',
								} }
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<button
						id={ `mm-col-trigger-add-${ column.id }` }
						className="mm-col-card__add-trigger"
						type="button"
						onClick={ () => {
							onSelectColumn( column.id );
							setIsAddingLink( true );
						} }
						style={ {
							width: '100%',
							padding: '6px 8px',
							borderRadius: '6px',
							border: '1px dashed #CBD5E1',
							background: 'transparent',
							color: '#4169F7',
							fontSize: '12px',
							fontWeight: 600,
							cursor: 'pointer',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '4px',
							transition: 'background 150ms ease',
						} }
					>
						<i id={ `mm-col-trigger-ico-${ column.id }` } className="ri-add-line"></i>
						<span>Add Link</span>
					</button>
				) }
			</div>
		</div>
	);
};

interface MegaMenuColumnBuilderProps {
	item: MenuItem | null;
	selectedColumnId: string | null;
	onSelectColumn: ( colId: string ) => void;
	onUpdateColumns: ( columns: MenuColumn[] ) => void;
}

export const MegaMenuColumnBuilder = ( {
	item,
	selectedColumnId,
	onSelectColumn,
	onUpdateColumns,
}: MegaMenuColumnBuilderProps ) => {
	const [ draggedColIdx, setDraggedColIdx ] = useState<number | null>( null );

	if ( ! item ) {
		return null;
	}

	const columns = item.columns || [];
	const activeColId = selectedColumnId && columns.some( ( c ) => c.id === selectedColumnId )
		? selectedColumnId
		: columns[ 0 ]?.id || null;

	const handleAddColumn = () => {
		const newCol: MenuColumn = {
			id: `col-${ Date.now() }`,
			heading: `Column ${ columns.length + 1 }`,
			items: [],
		};
		const next = [ ...columns, newCol ];
		onUpdateColumns( next );
		onSelectColumn( newCol.id );
	};

	const handleUpdateHeading = ( colId: string, heading: string ) => {
		onUpdateColumns(
			columns.map( ( col ) => ( col.id === colId ? { ...col, heading } : col ) )
		);
	};

	const handleRemoveColumn = ( colId: string ) => {
		const next = columns.filter( ( col ) => col.id !== colId );
		onUpdateColumns( next );
		if ( selectedColumnId === colId && next.length > 0 ) {
			onSelectColumn( next[ 0 ].id );
		}
	};

	const handleMoveColumn = ( index: number, direction: -1 | 1 ) => {
		const target = index + direction;
		if ( target < 0 || target >= columns.length ) {
			return;
		}
		const next = [ ...columns ];
		const [ moved ] = next.splice( index, 1 );
		next.splice( target, 0, moved );
		onUpdateColumns( next );
	};

	const handleAddLink = ( colId: string, label: string, url: string ) => {
		const newLink: MenuLinkItem = {
			id: `link-${ Date.now() }`,
			label,
			url,
			icon: 'ri-links-line',
		};
		onUpdateColumns(
			columns.map( ( col ) =>
				col.id === colId ? { ...col, items: [ ...col.items, newLink ] } : col
			)
		);
	};

	const handleRemoveLink = ( colId: string, linkId: string ) => {
		onUpdateColumns(
			columns.map( ( col ) =>
				col.id === colId
					? { ...col, items: col.items.filter( ( l ) => l.id !== linkId ) }
					: col
			)
		);
	};

	const handleMoveLink = ( colId: string, linkIdx: number, direction: -1 | 1 ) => {
		onUpdateColumns(
			columns.map( ( col ) => {
				if ( col.id !== colId ) {
					return col;
				}
				const target = linkIdx + direction;
				if ( target < 0 || target >= col.items.length ) {
					return col;
				}
				const nextItems = [ ...col.items ];
				const [ moved ] = nextItems.splice( linkIdx, 1 );
				nextItems.splice( target, 0, moved );
				return { ...col, items: nextItems };
			} )
		);
	};

	const handleAddSubLink = ( colId: string, linkId: string, label: string, url: string ) => {
		const newSub: MenuLinkItem = {
			id: `sub4-${ Date.now() }`,
			label,
			url,
			icon: 'ri-corner-down-right-line',
			children: [],
		};
		onUpdateColumns(
			columns.map( ( col ) => {
				if ( col.id !== colId ) {
					return col;
				}
				return {
					...col,
					items: col.items.map( ( l ) =>
						l.id === linkId
							? { ...l, children: [ ...( l.children || [] ), newSub ] }
							: l
					),
				};
			} )
		);
	};

	const handleRemoveSubLink = ( colId: string, linkId: string, subLinkId: string ) => {
		onUpdateColumns(
			columns.map( ( col ) => {
				if ( col.id !== colId ) {
					return col;
				}
				return {
					...col,
					items: col.items.map( ( l ) =>
						l.id === linkId
							? { ...l, children: ( l.children || [] ).filter( ( s ) => s.id !== subLinkId ) }
							: l
					),
				};
			} )
		);
	};

	const handleMoveSubLink = ( colId: string, linkId: string, subIdx: number, direction: -1 | 1 ) => {
		onUpdateColumns(
			columns.map( ( col ) => {
				if ( col.id !== colId ) {
					return col;
				}
				return {
					...col,
					items: col.items.map( ( l ) => {
						if ( l.id !== linkId ) {
							return l;
						}
						const subs = [ ...( l.children || [] ) ];
						const target = subIdx + direction;
						if ( target < 0 || target >= subs.length ) {
							return l;
						}
						const [ moved ] = subs.splice( subIdx, 1 );
						subs.splice( target, 0, moved );
						return { ...l, children: subs };
					} ),
				};
			} )
		);
	};

	const handleDragStartColumn = ( index: number ) => {
		setDraggedColIdx( index );
	};

	const handleDragOverColumn = ( e: React.DragEvent ) => {
		e.preventDefault();
	};

	const handleDropColumn = ( targetIndex: number ) => {
		if ( draggedColIdx === null || draggedColIdx === targetIndex ) {
			setDraggedColIdx( null );
			return;
		}
		const next = [ ...columns ];
		const [ moved ] = next.splice( draggedColIdx, 1 );
		next.splice( targetIndex, 0, moved );
		onUpdateColumns( next );
		setDraggedColIdx( null );
	};

	return (
		<div
			id="mm-column-builder-card"
			className="mm-card"
			style={ {
				background: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '12px',
				padding: '20px',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
			} }
		>
			{ /* Header */ }
			<div
				id="mm-column-builder-header"
				className="mm-card__header"
				style={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '12px',
					marginBottom: '14px',
					flexWrap: 'wrap',
				} }
			>
				<div id="mm-column-builder-title-wrap" className="mm-card__title-wrap">
					<div
						id="mm-column-builder-title-row"
						className="mm-card__title-row"
						style={ { display: 'flex', alignItems: 'center', gap: '8px' } }
					>
						<h3
							id="mm-column-builder-title"
							className="mm-card__title"
							style={ { margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' } }
						>
							Mega Menu Content Builder
						</h3>
						<span
							id="mm-column-builder-count-pill"
							className="mm-card__pill"
							style={ {
								fontSize: '11px',
								fontWeight: 600,
								padding: '2px 8px',
								borderRadius: '999px',
								background: '#EEF4FF',
								color: '#4169F7',
							} }
						>
							{ item.columnsCount } Columns Active
						</span>
					</div>
					<p
						id="mm-column-builder-subtitle"
						className="mm-card__subtitle"
						style={ { margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' } }
					>
						Click a column to set it as the target for added WordPress/WooCommerce items.
					</p>
				</div>

				<button
					id="mm-column-builder-add-col-btn"
					className="mm-btn mm-btn--outline"
					type="button"
					onClick={ handleAddColumn }
					style={ {
						display: 'inline-flex',
						alignItems: 'center',
						gap: '5px',
						padding: '7px 12px',
						fontSize: '12.5px',
						fontWeight: 600,
						color: '#4169F7',
						background: '#EEF4FF',
						border: '1px solid #C7D7FE',
						borderRadius: '8px',
						cursor: 'pointer',
						transition: 'all 150ms ease',
					} }
				>
					<i id="mm-column-builder-add-col-ico" className="ri-layout-column-line"></i>
					<span>Add Column</span>
				</button>
			</div>

			{ ! item.enableMegaMenu ? (
				<div
					id="mm-column-builder-disabled-notice"
					className="mm-column-builder__disabled"
					style={ {
						padding: '20px',
						background: '#F8FAFC',
						border: '1px dashed #CBD5E1',
						borderRadius: '10px',
						textAlign: 'center',
						color: '#64748B',
						fontSize: '13px',
					} }
				>
					<i
						id="mm-column-builder-disabled-ico"
						className="ri-information-line"
						style={ { fontSize: '20px', color: '#94A3B8', display: 'block', marginBottom: '6px' } }
					></i>
					Mega Menu is currently disabled for <strong>{ item.label }</strong>. Enable the{ ' ' }
					<strong>Enable Mega Menu</strong> toggle in Edit Menu Item to customize columns.
				</div>
			) : columns.length === 0 ? (
				<div
					id="mm-column-builder-empty"
					className="mm-column-builder__empty"
					style={ {
						padding: '24px',
						background: '#F8FAFC',
						border: '1px dashed #CBD5E1',
						borderRadius: '10px',
						textAlign: 'center',
						color: '#64748B',
						fontSize: '13px',
					} }
				>
					No columns configured for this menu item yet. Click <strong>Add Column</strong> to start.
				</div>
			) : (
				<div
					id="mm-column-builder-grid"
					className="mm-column-builder__grid"
					style={ {
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
						gap: '12px',
					} }
				>
					{ columns.map( ( col, idx ) => (
						<MegaMenuColumn
							key={ col.id }
							column={ col }
							index={ idx }
							totalColumns={ columns.length }
							isSelected={ col.id === activeColId }
							isVisibleInGrid={ idx < item.columnsCount }
							onSelectColumn={ onSelectColumn }
							onUpdateHeading={ handleUpdateHeading }
							onRemoveColumn={ handleRemoveColumn }
							onMoveColumn={ handleMoveColumn }
							onAddLink={ handleAddLink }
							onRemoveLink={ handleRemoveLink }
							onMoveLink={ handleMoveLink }
							onAddSubLink={ handleAddSubLink }
							onRemoveSubLink={ handleRemoveSubLink }
							onMoveSubLink={ handleMoveSubLink }
							onDragStartColumn={ handleDragStartColumn }
							onDragOverColumn={ handleDragOverColumn }
							onDropColumn={ handleDropColumn }
						/>
					) ) }
				</div>
			) }
		</div>
	);
};

