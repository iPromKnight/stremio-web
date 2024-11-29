// Copyright (C) 2017-2024 Smart code 203358507

import React, { useCallback, DetailedHTMLProps, HTMLAttributes, ChangeEvent } from 'react';
import classNames from 'classnames';
import styles from './Checkbox.less';
import Icon from '@stremio/stremio-icons/react';

type Props = {
    disabled?: boolean;
    checked?: boolean;
    className?: string;
    onChange?: (checked: boolean) => void;
    ariaLabel?: string;
    error?: string;
};

const Checkbox = ({ disabled, checked, className, onChange, ariaLabel, error }: Props) => {

    const handleChangeCheckbox = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(target.checked);
    }, [onChange]);

    const onKeyDown = useCallback(({ key }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
        if ((key === 'Enter' || key === ' ') && !disabled) {
            onChange && onChange(!checked);
        }
    }, [disabled, checked, onChange]);

    return (
        <div className={classNames(styles['checkbox'], className)}>
            <label>
                <div
                    className={classNames({
                        [styles['checkbox-checked']]: checked,
                        [styles['checkbox-unchecked']]: !checked,
                        [styles['checkbox-error']]: error,
                        [styles['checkbox-disabled']]: disabled,
                    })}
                >
                    <div
                        className={styles['checkbox-container']}
                        role={'input'}
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                    >
                        <input
                            type={'checkbox'}
                            onChange={handleChangeCheckbox}
                            aria-label={ariaLabel}
                            tabIndex={-1}
                            disabled={disabled}
                        />
                        {
                            checked ?
                                <Icon name={'checkmark'} className={styles['checkbox-icon']} />
                                : null
                        }
                    </div>
                </div>
            </label>
        </div>
    );
};

export default Checkbox;
