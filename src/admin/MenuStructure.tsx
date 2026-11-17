/**
 * Section A — Menu Structure & Read/Select/Reorder Tree (Levels 1 -> 2 -> 3 -> 4)
 * Clicking "+ Manage in Mega Menu Content" or any sub-node jumps to Mega Menu Content Builder on the right.
 *
 * @package starter-theme
 */

import { useEffect, useState } from '@wordpress/element';
import type { MenuItem, MenuLinkItem } from './types';

interface RecursiveSubNodeProps {
	node: MenuLinkItem;
	level: 2 | 3 | 4;
	index: number;
	total: number;
	expandedMap: Record<string, boolean>;
	onToggleExpand: (id: string) => void;
	onSelectNodeInBuilder: () => void;
	onUpdateNode: (updated: MenuLinkItem | null) => void;
	onMoveNode: (dir: -1 | 1) => void;
}

function RecursiveSubNode({
	node,
	level,
	index,
	total,
	expandedMap,
	onToggleExpand,
	onSelectNodeInBuilder,
	onUpdateNode,
	onMoveNode,
}: RecursiveSubNodeProps) {
	const children = node.children || [];
	const hasChildren = level < 4 && children.length > 0;
	const isExpanded = !!expandedMap[node.id];

	const handleUpdateChildAt = (idx: number, updatedChild: MenuLinkItem | null) => {
		const nextChildren = [...children];
		if (updatedChild === null) {
			nextChildren.splice(idx, 1);
		} else {
			nextChildren[idx] = updatedChild;
		}
		onUpdateNode({ ...node, children: nextChildren });
	};

	const handleMoveChildAt = (idx: number, dir: -1 | 1) => {
		const target = idx + dir;
		if (target < 0 || target >= children.length) return;
		const nextChildren = [...children];
		const [moved] = nextChildren.splice(idx, 1);
		nextChildren.splice(target, 0, moved);
		onUpdateNode({ ...node, children: nextChildren });
	};

	const levelColors: Record<number, { bg: string; text: string; border: string }> = {
		2: { bg: '#EEF4FF', text: '#4169F7', border: '#DBEAFE' },
		3: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
		4: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
	};
	const badgeTheme = levelColors[level] || levelColors[2];

	return (
		<div
			id={`mm-sub-node-${node.id}`}
			className={`mm-sub-node mm-sub-node--lvl-${level}`}
			style={{
				marginTop: '5px',
				borderRadius: '8px',
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0',
				overflow: 'hidden',
			}}
		>
			<div
				id={`mm-sub-row-${node.id}`}
				className="mm-sub-row"
				onClick={() => {
					if (hasChildren) {
						onToggleExpand(node.id);
					}
					onSelectNodeInBuilder();
				}}
				role="button"
				tabIndex={0}
				aria-expanded={hasChildren ? isExpanded : undefined}
				onKeyDown={(event) => {
					if ((event.key === 'Enter' || event.key === ' ') && hasChildren) {
						event.preventDefault();
						onToggleExpand(node.id);
					}
				}}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '6px 8px',
					gap: '6px',
					fontSize: '12.5px',
					color: '#334155',
					cursor: 'pointer',
				}}
			>
				<div
					id={`mm-sub-left-${node.id}`}
					className="mm-sub-left"
					style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}
				>
					<span
						id={`mm-sub-lvl-badge-${node.id}`}
						className="mm-sub-lvl-badge"
						style={{
							fontSize: '9.5px',
							fontWeight: 700,
							padding: '1px 5px',
							borderRadius: '4px',
							backgroundColor: badgeTheme.bg,
							color: badgeTheme.text,
							border: `1px solid ${badgeTheme.border}`,
							flexShrink: 0,
						}}
					>
						L{level}
					</span>

					<i
						id={`mm-sub-ico-${node.id}`}
						className={node.icon || (level === 2 ? 'ri-folder-3-line' : 'ri-corner-down-right-line')}
						style={{ color: '#64748B', fontSize: '13px', flexShrink: 0 }}
					></i>

					<span
						id={`mm-sub-title-${node.id}`}
						className="mm-sub-title"
						style={{
							fontWeight: level === 2 ? 600 : 500,
							color: level === 2 ? '#0F172A' : '#334155',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{node.label}
					</span>

					{children.length > 0 && (
						<span
							id={`mm-sub-count-${node.id}`}
							className="mm-sub-count"
							style={{
								fontSize: '10px',
								fontWeight: 600,
								color: '#64748B',
								backgroundColor: '#F1F5F9',
								padding: '1px 5px',
								borderRadius: '999px',
								flexShrink: 0,
							}}
						>
							{children.length}
						</span>
					)}
				</div>

				<div
					id={`mm-sub-actions-${node.id}`}
					className="mm-sub-actions"
					style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
					onClick={(e) => e.stopPropagation()}
				>
					{hasChildren && (
						<button
							id={`mm-sub-expand-btn-${node.id}`}
							className="mm-sub-icon-btn"
							type="button"
							onClick={() => onToggleExpand(node.id)}
							title="กาง/ย่อเมนูย่อย"
							style={subIconBtnStyle('#64748B')}
						>
							<i
								id={`mm-sub-expand-ico-${node.id}`}
								className={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
							></i>
						</button>
					)}
					<button
						id={`mm-sub-up-btn-${node.id}`}
						className="mm-sub-icon-btn"
						type="button"
						disabled={index === 0}
						onClick={() => onMoveNode(-1)}
						title="เลื่อนขึ้น"
						style={subIconBtnStyle(index === 0 ? '#CBD5E1' : '#64748B', index === 0)}
					>
						<i id={`mm-sub-up-ico-${node.id}`} className="ri-arrow-up-line" style={{ fontSize: '11.5px' }}></i>
					</button>

					<button
						id={`mm-sub-down-btn-${node.id}`}
						className="mm-sub-icon-btn"
						type="button"
						disabled={index === total - 1}
						onClick={() => onMoveNode(1)}
						title="เลื่อนลง"
						style={subIconBtnStyle(index === total - 1 ? '#CBD5E1' : '#64748B', index === total - 1)}
					>
						<i id={`mm-sub-down-ico-${node.id}`} className="ri-arrow-down-line" style={{ fontSize: '11.5px' }}></i>
					</button>

					<button
						id={`mm-sub-del-btn-${node.id}`}
						className="mm-sub-icon-btn"
						type="button"
						onClick={() => onUpdateNode(null)}
						title="ลบรายการนี้"
						style={subIconBtnStyle('#EF4444')}
					>
						<i id={`mm-sub-del-ico-${node.id}`} className="ri-close-line"></i>
					</button>
				</div>
			</div>

			{ /* Nested Level (L3 or L4) */}
			{hasChildren && isExpanded && (
				<div
					id={`mm-sub-children-${node.id}`}
					className="mm-sub-children"
					style={{
						padding: '4px 8px 8px 18px',
						borderTop: '1px solid #F1F5F9',
						backgroundColor: level === 2 ? '#F8FAFC' : '#F1F5F9',
					}}
				>
					{children.map((childNode, cIdx) => (
						<RecursiveSubNode
							key={childNode.id}
							node={childNode}
							level={(level + 1) as 3 | 4}
							index={cIdx}
							total={children.length}
							expandedMap={expandedMap}
							onToggleExpand={onToggleExpand}
							onSelectNodeInBuilder={onSelectNodeInBuilder}
							onUpdateNode={(updated) => handleUpdateChildAt(cIdx, updated)}
							onMoveNode={(dir) => handleMoveChildAt(cIdx, dir)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function subIconBtnStyle(color: string, disabled = false): Record<string, any> {
	return {
		width: '21px',
		height: '21px',
		border: 'none',
		background: 'transparent',
		color,
		cursor: disabled ? 'not-allowed' : 'pointer',
		padding: 0,
		borderRadius: '4px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '13.5px',
	};
}

interface MenuTreeItemProps {
	item: MenuItem;
	index: number;
	total: number;
	isSelected: boolean;
	isExpanded: boolean;
	expandedMap: Record<string, boolean>;
	onToggleSubExpand: (id: string) => void;
	onSelect: () => void;
	onToggleExpand: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onUpdateChildrenTree: (nextChildren: MenuLinkItem[]) => void;
	onJumpToColumnBuilder: (menuId: string, colId?: string, createNewColumn?: boolean) => void;
	onDragStartItem: (index: number) => void;
	onDragOverItem: (e: any, index: number) => void;
	onDropItem: (e: any, index: number) => void;
	isDragOver: boolean;
}

export function MenuTreeItem({
	item,
	index,
	total,
	isSelected,
	isExpanded,
	expandedMap,
	onToggleSubExpand,
	onSelect,
	onToggleExpand,
	onDuplicate,
	onDelete,
	onMoveUp,
	onMoveDown,
	onUpdateChildrenTree,
	onJumpToColumnBuilder,
	onDragStartItem,
	onDragOverItem,
	onDropItem,
	isDragOver,
}: MenuTreeItemProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	const children = item.children || [];
	const hasChildren = children.length > 0 || item.enableMegaMenu;

	const handleUpdateL2At = (idx: number, updated: MenuLinkItem | null) => {
		const next = [...children];
		if (updated === null) {
			next.splice(idx, 1);
		} else {
			next[idx] = updated;
		}
		onUpdateChildrenTree(next);
	};

	const handleMoveL2At = (idx: number, dir: -1 | 1) => {
		const target = idx + dir;
		if (target < 0 || target >= children.length) return;
		const next = [...children];
		const [moved] = next.splice(idx, 1);
		next.splice(target, 0, moved);
		onUpdateChildrenTree(next);
	};

	return (
		<div
			id={`mm-tree-item-${item.id}`}
			className="mm-tree-item"
			draggable
			onDragStart={() => onDragStartItem(index)}
			onDragOver={(e) => onDragOverItem(e, index)}
			onDrop={(e) => onDropItem(e, index)}
			style={{
				borderRadius: '10px',
				border: isDragOver ? '1.5px dashed #4169F7' : (isSelected ? '1px solid #C7D7FE' : '1px solid #E2E8F0'),
				borderLeft: isSelected ? '3.5px solid #4169F7' : (isDragOver ? '1.5px dashed #4169F7' : '1px solid #E2E8F0'),
				backgroundColor: isSelected ? '#EEF4FF' : '#FFFFFF',
				transition: 'all 160ms ease',
				marginBottom: '8px',
			}}
		>
			<div
				id={`mm-tree-row-${item.id}`}
				className="mm-tree-row"
				onClick={onSelect}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '10px 12px',
					cursor: 'pointer',
					gap: '8px',
				}}
			>
				<div id={`mm-tree-left-${item.id}`} className="mm-tree-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
					<span
						id={`mm-tree-drag-${item.id}`}
						className="mm-tree-drag"
						title="Drag to reorder"
						style={{ color: '#94A3B8', cursor: 'grab', display: 'inline-flex', alignItems: 'center', fontSize: '15px' }}
					>
						<i id={`mm-tree-drag-ico-${item.id}`} className="ri-draggable"></i>
					</span>

					<span
						id={`mm-tree-icon-${item.id}`}
						className="mm-tree-icon"
						style={{
							width: '28px',
							height: '28px',
							borderRadius: '7px',
							backgroundColor: isSelected ? '#DBEAFE' : '#F1F5F9',
							color: isSelected ? '#4169F7' : '#475569',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '14px',
							flexShrink: 0,
						}}
					>
						<i id={`mm-tree-icon-i-${item.id}`} className={item.icon || 'ri-links-line'}></i>
					</span>

					<div id={`mm-tree-label-wrap-${item.id}`} className="mm-tree-label-wrap" style={{ minWidth: 0, flex: 1 }}>
						<div
							id={`mm-tree-title-${item.id}`}
							className="mm-tree-title"
							style={{
								fontSize: '13.5px',
								fontWeight: isSelected ? 600 : 500,
								color: isSelected ? '#1E3A8A' : '#0F172A',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
						>
							{item.label}
						</div>
						{item.enableMegaMenu && (
							<span
								id={`mm-tree-badge-${item.id}`}
								className="mm-tree-badge"
								style={{
									display: 'inline-block',
									fontSize: '10px',
									fontWeight: 600,
									color: '#4169F7',
									backgroundColor: '#E0E7FF',
									padding: '1px 6px',
									borderRadius: '999px',
									marginTop: '2px',
								}}
							>
								Mega Menu ({item.columnsCount} Cols)
							</span>
						)}
					</div>
				</div>

				<div
					id={`mm-tree-actions-${item.id}`}
					className="mm-tree-actions"
					style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}
					onClick={(e) => e.stopPropagation()}
				>
					{hasChildren && (
						<button
							id={`mm-tree-expand-${item.id}`}
							className="mm-tree-expand-btn"
							type="button"
							onClick={onToggleExpand}
							aria-label="Expand or collapse sub-items"
							aria-expanded={isExpanded}
							style={{
								width: '26px',
								height: '26px',
								borderRadius: '6px',
								border: 'none',
								backgroundColor: 'transparent',
								color: '#64748B',
								cursor: 'pointer',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<i id={`mm-tree-expand-ico-${item.id}`} className={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} style={{ fontSize: '16px' }}></i>
						</button>
					)}
					{isSelected && (
						<button
							id={`mm-tree-deselect-${item.id}`}
							className="mm-tree-deselect-btn"
							type="button"
							title="ยกเลิกการเลือกเมนู"
							aria-label="ยกเลิกการเลือกเมนู"
							onClick={onSelect}
							style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#64748B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
						>
							<i id={`mm-tree-deselect-ico-${item.id}`} className="ri-close-line"></i>
						</button>
					)}

					<button
						id={`mm-tree-more-${item.id}`}
						className="mm-tree-more-btn"
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						aria-label="Menu item actions"
						style={{
							width: '26px',
							height: '26px',
							borderRadius: '6px',
							border: 'none',
							backgroundColor: menuOpen ? '#E2E8F0' : 'transparent',
							color: '#64748B',
							cursor: 'pointer',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<i id={`mm-tree-more-ico-${item.id}`} className="ri-more-2-fill" style={{ fontSize: '15px' }}></i>
					</button>

					{menuOpen && (
						<div
							id={`mm-tree-dropdown-${item.id}`}
							className="mm-tree-dropdown"
							style={{
								position: 'absolute',
								right: 0,
								top: '30px',
								zIndex: 50,
								width: '175px',
								backgroundColor: '#FFFFFF',
								border: '1px solid #E2E8F0',
								borderRadius: '10px',
								boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
								padding: '4px',
							}}
						>
							<button
								id={`mm-act-add-sub-${item.id}`}
								className="mm-act-btn"
								type="button"
								onClick={() => {
									setMenuOpen(false);
									onJumpToColumnBuilder(item.id, undefined, true);
								}}
								style={actionItemStyle}
							>
								<i id={`mm-act-add-sub-ico-${item.id}`} className="ri-layout-column-line"></i>
								<span>Add Column (Right)</span>
							</button>
							<button
								id={`mm-act-edit-${item.id}`}
								className="mm-act-btn"
								type="button"
								onClick={() => {
									onSelect();
									setMenuOpen(false);
								}}
								style={actionItemStyle}
							>
								<i id={`mm-act-edit-ico-${item.id}`} className="ri-edit-line"></i>
								<span>Edit item</span>
							</button>
							<button
								id={`mm-act-dup-${item.id}`}
								className="mm-act-btn"
								type="button"
								onClick={() => {
									onDuplicate();
									setMenuOpen(false);
								}}
								style={actionItemStyle}
							>
								<i id={`mm-act-dup-ico-${item.id}`} className="ri-file-copy-line"></i>
								<span>Duplicate</span>
							</button>
							<button
								id={`mm-act-up-${item.id}`}
								className="mm-act-btn"
								type="button"
								disabled={index === 0}
								onClick={() => {
									onMoveUp();
									setMenuOpen(false);
								}}
								style={Object.assign({}, actionItemStyle, index === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {})}
							>
								<i id={`mm-act-up-ico-${item.id}`} className="ri-arrow-up-line"></i>
								<span>Move up</span>
							</button>
							<button
								id={`mm-act-down-${item.id}`}
								className="mm-act-btn"
								type="button"
								disabled={index === total - 1}
								onClick={() => {
									onMoveDown();
									setMenuOpen(false);
								}}
								style={Object.assign({}, actionItemStyle, index === total - 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {})}
							>
								<i id={`mm-act-down-ico-${item.id}`} className="ri-arrow-down-line"></i>
								<span>Move down</span>
							</button>
							<div id={`mm-act-sep-${item.id}`} className="mm-act-sep" style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
							<button
								id={`mm-act-del-${item.id}`}
								className="mm-act-btn-del"
								type="button"
								onClick={() => {
									onDelete();
									setMenuOpen(false);
								}}
								style={Object.assign({}, actionItemStyle, { color: '#EF4444' })}
							>
								<i id={`mm-act-del-ico-${item.id}`} className="ri-delete-bin-line"></i>
								<span>Remove</span>
							</button>
						</div>
					)}
				</div>
			</div>

			{ /* Nested Sub-items List (Level 2 -> Level 3 -> Level 4) */}
			{isExpanded && (
				<div
					id={`mm-tree-children-${item.id}`}
					className="mm-tree-children"
					style={{
						padding: '6px 10px 10px 18px',
						borderTop: '1px solid #E2E8F0',
						backgroundColor: isSelected ? '#F5F8FF' : '#F8FAFC',
						borderRadius: '0 0 10px 10px',
					}}
				>
					{children.length === 0 && (
						<div
							id={`mm-sub-empty-${item.id}`}
							className="mm-sub-empty"
							style={{
								fontSize: '11.5px',
								color: '#64748B',
								padding: '6px 4px 2px 4px',
							}}
						>
							ยังไม่มีคอลัมน์ย่อย กดปุ่มด้านล่างเพื่อเพิ่มและจัดการใน Mega Menu Content Builder ฝั่งขวา
						</div>
					)}

					{children.map((child: MenuLinkItem, cIdx: number) => {
						const mappedColId = child.id.startsWith('col-')
							? child.id
							: `col-${child.id.replace(/^sub-/, '')}`;
						return (
							<RecursiveSubNode
								key={child.id}
								node={child}
								level={2}
								index={cIdx}
								total={children.length}
								expandedMap={expandedMap}
								onToggleExpand={onToggleSubExpand}
								onSelectNodeInBuilder={() => onJumpToColumnBuilder(item.id, mappedColId, false)}
								onUpdateNode={(updated) => handleUpdateL2At(cIdx, updated)}
								onMoveNode={(dir) => handleMoveL2At(cIdx, dir)}
							/>
						);
					})}

					<button
						id={`mm-sub-quick-add-${item.id}`}
						className="mm-sub-quick-add"
						type="button"
						onClick={() => onJumpToColumnBuilder(item.id, undefined, true)}
						style={{
							marginTop: '8px',
							display: 'inline-flex',
							alignItems: 'center',
							gap: '5px',
							fontSize: '11.5px',
							fontWeight: 600,
							color: '#4169F7',
							background: '#EEF4FF',
							border: '1px solid #C7D7FE',
							borderRadius: '6px',
							cursor: 'pointer',
							padding: '5px 10px',
						}}
					>
						<i id={`mm-sub-quick-add-ico-${item.id}`} className="ri-add-line"></i>
						<span>Add Column in Mega Menu Content</span>
						<i id={`mm-sub-quick-arrow-${item.id}`} className="ri-arrow-right-line"></i>
					</button>
				</div>
			)}
		</div>
	);
}

const actionItemStyle: Record<string, any> = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	width: '100%',
	padding: '7px 10px',
	fontSize: '12.5px',
	fontWeight: 500,
	color: '#334155',
	backgroundColor: 'transparent',
	border: 'none',
	borderRadius: '6px',
	cursor: 'pointer',
	textAlign: 'left',
};

interface MenuStructureProps {
	items: MenuItem[];
	selectedId: string;
	onSelect: (id: string) => void;
	onAddMenuItem: (label: string, url: string) => void;
	onDuplicateMenuItem: (id: string) => void;
	onDeleteMenuItem: (id: string) => void;
	onReorderMenuItems: (fromIndex: number, toIndex: number) => void;
	onUpdateChildrenTree: (menuId: string, nextChildren: MenuLinkItem[]) => void;
	onJumpToColumnBuilder: (menuId: string, colId?: string, createNewColumn?: boolean) => void;
}

export function MenuStructure({
	items,
	selectedId,
	onSelect,
	onAddMenuItem,
	onDuplicateMenuItem,
	onDeleteMenuItem,
	onReorderMenuItems,
	onUpdateChildrenTree,
	onJumpToColumnBuilder,
}: MenuStructureProps) {
	const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
	const [showAddModal, setShowAddModal] = useState(false);
	const [newLabel, setNewLabel] = useState('');
	const [newUrl, setNewUrl] = useState('/');
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const selectedChildrenCount = items.find((item) => item.id === selectedId)?.children?.length || 0;

	useEffect(() => {
		if (selectedId && selectedChildrenCount > 0) {
			setExpandedIds((prev) => (prev[selectedId] ? prev : { ...prev, [selectedId]: true }));
		}
	}, [selectedId, selectedChildrenCount]);

	const toggleExpand = (id: string) => {
		setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleCreateSubmit = (e: any) => {
		e.preventDefault();
		if (!newLabel.trim()) return;
		onAddMenuItem(newLabel.trim(), newUrl.trim() || '/');
		setNewLabel('');
		setNewUrl('/');
		setShowAddModal(false);
	};

	return (
		<section
			id="mm-section-structure"
			className="mm-card"
			style={{
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '12px',
				padding: '20px',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
			}}
		>
			<div
				id="mm-structure-header"
				className="mm-section-header"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: '16px',
				}}
			>
				<div>
					<h2
						id="mm-structure-title"
						className="mm-section-title"
						style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}
					>
						Menu Structure
					</h2>
					<p
						id="mm-structure-desc"
						className="mm-section-subtitle"
						style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}
					>
						Select an item to manage its columns on the right.
					</p>
				</div>

				<button
					id="mm-add-menu-trigger"
					className="mm-btn-outline"
					type="button"
					onClick={() => setShowAddModal(!showAddModal)}
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '5px',
						padding: '7px 12px',
						borderRadius: '8px',
						border: '1px solid #CBD5E1',
						backgroundColor: '#FFFFFF',
						color: '#0F172A',
						fontSize: '12.5px',
						fontWeight: 600,
						cursor: 'pointer',
						transition: 'all 150ms ease',
					}}
				>
					<i id="mm-add-menu-trigger-ico" className="ri-add-line" style={{ color: '#4169F7', fontSize: '15px' }}></i>
					<span>Add Item</span>
				</button>
			</div>

			{showAddModal && (
				<form
					id="mm-add-item-form"
					className="mm-add-item-form"
					onSubmit={handleCreateSubmit}
					style={{
						padding: '12px',
						backgroundColor: '#F8FAFC',
						border: '1px solid #E2E8F0',
						borderRadius: '10px',
						marginBottom: '14px',
					}}
				>
					<div id="mm-add-item-fields" className="mm-add-item-fields" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<input
							id="mm-new-item-label"
							className="mm-input"
							type="text"
							placeholder="Menu Label (e.g. Pricing)"
							value={newLabel}
							onChange={(e) => setNewLabel(e.target.value)}
							autoFocus
							style={{
								padding: '7px 10px',
								fontSize: '12.5px',
								border: '1px solid #CBD5E1',
								borderRadius: '7px',
								backgroundColor: '#FFFFFF',
							}}
						/>
						<input
							id="mm-new-item-url"
							className="mm-input"
							type="text"
							placeholder="URL (e.g. /pricing)"
							value={newUrl}
							onChange={(e) => setNewUrl(e.target.value)}
							style={{
								padding: '7px 10px',
								fontSize: '12.5px',
								border: '1px solid #CBD5E1',
								borderRadius: '7px',
								backgroundColor: '#FFFFFF',
							}}
						/>
						<div id="mm-add-item-btns" className="mm-add-item-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
							<button
								id="mm-add-item-cancel"
								className="mm-btn-cancel"
								type="button"
								onClick={() => setShowAddModal(false)}
								style={{
									padding: '6px 10px',
									fontSize: '12px',
									borderRadius: '6px',
									border: '1px solid #CBD5E1',
									backgroundColor: '#FFFFFF',
									color: '#475569',
									cursor: 'pointer',
								}}
							>
								Cancel
							</button>
							<button
								id="mm-add-item-submit"
								className="mm-btn-submit"
								type="submit"
								style={{
									padding: '6px 12px',
									fontSize: '12px',
									fontWeight: 600,
									borderRadius: '6px',
									border: 'none',
									backgroundColor: '#4169F7',
									color: '#FFFFFF',
									cursor: 'pointer',
								}}
							>
								Add Menu Item
							</button>
						</div>
					</div>
				</form>
			)}

			<div id="mm-tree-list" className="mm-tree-list">
				{items.length === 0 ? (
					<div
						id="mm-tree-empty"
						className="mm-tree-empty"
						style={{
							padding: '28px 16px',
							textAlign: 'center',
							backgroundColor: '#F8FAFC',
							borderRadius: '10px',
							border: '1px dashed #CBD5E1',
							color: '#64748B',
							fontSize: '13px',
						}}
					>
						No menu items yet. Click &ldquo;Add Item&rdquo; to create one.
					</div>
				) : (
					items.map((item, index) => (
						<MenuTreeItem
							key={item.id}
							item={item}
							index={index}
							total={items.length}
							isSelected={item.id === selectedId}
							isExpanded={!!expandedIds[item.id]}
							expandedMap={expandedIds}
							onToggleSubExpand={toggleExpand}
							onSelect={() => onSelect(item.id)}
							onToggleExpand={() => toggleExpand(item.id)}
							onDuplicate={() => onDuplicateMenuItem(item.id)}
							onDelete={() => onDeleteMenuItem(item.id)}
							onMoveUp={() => index > 0 && onReorderMenuItems(index, index - 1)}
							onMoveDown={() => index < items.length - 1 && onReorderMenuItems(index, index + 1)}
							onUpdateChildrenTree={(nextChildren) => onUpdateChildrenTree(item.id, nextChildren)}
							onJumpToColumnBuilder={onJumpToColumnBuilder}
							onDragStartItem={(idx) => setDragIndex(idx)}
							onDragOverItem={(e, idx) => {
								e.preventDefault();
								if (dragOverIndex !== idx) setDragOverIndex(idx);
							}}
							onDropItem={(e, targetIdx) => {
								e.preventDefault();
								if (dragIndex !== null && dragIndex !== targetIdx) {
									onReorderMenuItems(dragIndex, targetIdx);
								}
								setDragIndex(null);
								setDragOverIndex(null);
							}}
							isDragOver={dragOverIndex === index && dragIndex !== index}
						/>
					))
				)}
			</div>
		</section>
	);
}
